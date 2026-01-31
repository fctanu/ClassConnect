import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { hashToken, compareToken } from '../utils/hash';
import { refreshCookieOptions } from '../config/cookie';

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
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(400).json({ message: 'User exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: normalizedEmail, password: hashed });
  return res.json({ userId: user._id });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  const hashed = await hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(hashed);
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
  res.clearCookie('jid', { path: '/api/auth/refresh' });
  return res.json({ success: true });
});

export default router;
