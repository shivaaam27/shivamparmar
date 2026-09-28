import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Owner-only sign-in for /insights, via GitHub. No database: after GitHub
 * confirms who you are, and only if that is INSIGHTS_GITHUB_USER, the server
 * sets a signed, httpOnly cookie that lasts 30 days.
 *
 * Env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, INSIGHTS_GITHUB_USER, AUTH_SECRET
 */

export const SESSION_COOKIE = 'insights_session';
export const STATE_COOKIE = 'insights_oauth_state';
const MAX_AGE = 60 * 60 * 24 * 30;

export const authConfigured = () =>
  Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.INSIGHTS_GITHUB_USER && process.env.AUTH_SECRET);

/**
 * AUTH_SECRET signs the session cookie; anyone who can guess it can forge a
 * sign-in. Refuse to sign in (or trust a cookie) until it is long and random.
 */
export const MIN_SECRET = 32;
export const secretStrong = () => {
  const s = process.env.AUTH_SECRET ?? '';
  return s.length >= MIN_SECRET && new Set(s).size >= 12;
};

export const allowedUser = () => (process.env.INSIGHTS_GITHUB_USER ?? '').trim().toLowerCase();

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (data: string) => createHmac('sha256', process.env.AUTH_SECRET ?? '').update(data).digest('base64url');

export function createSession(login: string) {
  const payload = b64(JSON.stringify({ u: login.toLowerCase(), exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return { value: `${payload}.${sign(payload)}`, maxAge: MAX_AGE };
}

/** The signed-in owner's GitHub login, or null. */
export async function currentUser(): Promise<string | null> {
  if (!authConfigured() || !secretStrong()) return null;
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof u !== 'string' || typeof exp !== 'number' || exp < Date.now() / 1000) return null;
    return u === allowedUser() ? u : null;
  } catch {
    return null;
  }
}

export const newState = () => randomBytes(24).toString('base64url');

export const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
