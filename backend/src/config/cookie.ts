import { CookieOptions } from 'express';

export function refreshCookieOptions(): CookieOptions {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    // maxAge optional: leave to refresh token expiry
  };
}

export default refreshCookieOptions;
