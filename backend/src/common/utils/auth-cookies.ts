import type { CookieOptions, Response } from 'express';

/**
 * Options for the HttpOnly auth cookies.
 *
 * Built per call rather than once at module load: `secure` depends on
 * NODE_ENV/FRONTEND_URL, and reading those at import time meant a process that
 * started before they were populated served Secure-less cookies for its whole
 * lifetime.
 */
export function authCookieOptions(): CookieOptions {
  const frontendUrl = process.env.FRONTEND_URL ?? '';
  const secure =
    process.env.NODE_ENV === 'production' || frontendUrl.startsWith('https');
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/** clearCookie only matches a cookie whose path/domain line up with the set. */
export function clearAuthCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...rest } = authCookieOptions();
  return rest;
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie('access_token', accessToken, authCookieOptions());
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  const options = authCookieOptions();
  res.cookie('access_token', tokens.accessToken, options);
  res.cookie('refresh_token', tokens.refreshToken, options);
}

export function clearAuthCookies(res: Response) {
  const options = clearAuthCookieOptions();
  res.clearCookie('access_token', options);
  res.clearCookie('refresh_token', options);
}
