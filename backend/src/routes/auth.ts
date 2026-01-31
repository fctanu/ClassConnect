import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User';
import { hashToken, compareToken } from '../utils/hash';
import { refreshCookieOptions } from '../config/cookie';
import { logSecurityEvent } from '../middleware/securityLogger';

const router = Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

function signAccess(user: { _id: unknown }) {
  return jwt.sign(
    { sub: user._id as unknown },
    ACCESS_SECRET as unknown as jwt.Secret,
    { expiresIn: process.env.ACCESS_EXPIRES || '15m' } as jwt.SignOptions,
  );
}

function signRefresh(user: { _id: unknown }) {
  return jwt.sign(
    { sub: user._id as unknown },
    REFRESH_SECRET as unknown as jwt.Secret,
    { expiresIn: process.env.REFRESH_EXPIRES || '30d' } as jwt.SignOptions,
  );
}

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })) {
    return res.status(400).json({
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const existing = await User.findOne({ email: normalizedEmail });

  // Generic message to prevent user enumeration
  if (existing) {
    logSecurityEvent('REGISTER_FAIL_EXISTING', { email: normalizedEmail }, req);
    return res.status(400).json({ message: 'Registration failed. Please check your information.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: normalizedEmail, password: hashed });
  logSecurityEvent('REGISTER_SUCCESS', { userId: user._id, email: normalizedEmail }, req);
  return res.json({ userId: user._id });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    logSecurityEvent('LOGIN_FAIL_NO_USER', { email: normalizedEmail }, req);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if account is locked
  if (user.isLocked()) {
    logSecurityEvent('LOGIN_BLOCKED_LOCKED', { email: normalizedEmail, attempts: user.loginAttempts }, req);
    return res.status(423).json({
      message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
    });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    await user.incrementLoginAttempts();
    logSecurityEvent('LOGIN_FAIL_PASSWORD', { email: normalizedEmail }, req);

    // Refresh user to get updated attempts count
    await user.save();
    const updatedUser = await User.findById(user._id);

    // Check if just locked
    const remainingAttempts = 5 - (updatedUser?.loginAttempts || 0);
    if (remainingAttempts > 0) {
      return res.status(401).json({
        message: `Invalid email or password. ${remainingAttempts} attempt(s) remaining.`
      });
    } else {
      logSecurityEvent('ACCOUNT_LOCKED', { email: normalizedEmail }, req);
      return res.status(423).json({
        message: 'Account locked due to too many failed attempts. Try again in 2 hours.'
      });
    }
  }

  // Successful login - reset attempts
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  logSecurityEvent('LOGIN_SUCCESS', { userId: user._id }, req);
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  const hashed = await hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(hashed);

  // Limit to last 5 tokens (5 concurrent sessions)
  const maxTokensPerUser = 5;
  if (user.refreshTokens.length > maxTokensPerUser) {
    user.refreshTokens = user.refreshTokens.slice(-maxTokensPerUser);
  }

  await user.save();
  res.cookie('jid', refreshToken, refreshCookieOptions());
  return res.json({ accessToken });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.jid;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { sub?: string };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh' });
    let foundIndex = -1;
    user.refreshTokens = user.refreshTokens || [];
    for (let i = 0; i < (user.refreshTokens || []).length; i++) {
      const hashed = user.refreshTokens[i];
      if (await compareToken(token, hashed)) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex === -1) {
      // possible reuse - revoke all
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ message: 'Token reused or revoked' });
    }
    // rotate
    user.refreshTokens.splice(foundIndex, 1);
    const newRefresh = signRefresh(user);
    const newHashed = await hashToken(newRefresh);
    user.refreshTokens.push(newHashed);
    await user.save();
    const newAccess = signAccess(user);
    res.cookie('jid', newRefresh, refreshCookieOptions());
    return res.json({ accessToken: newAccess });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.jid;
  if (!token) return res.json({ success: true });
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { sub?: string };
    const user = await User.findById(payload.sub);
    if (user) {
      user.refreshTokens = user.refreshTokens || [];
      const remaining: string[] = [];
      for (const hashed of user.refreshTokens) {
        if (!(await compareToken(token, hashed))) remaining.push(hashed);
      }
      user.refreshTokens = remaining;
      await user.save();
    }
  } catch (err) {
    // ignore
  }
  res.clearCookie('jid', refreshCookieOptions());
  return res.json({ success: true });
});

export default router;
