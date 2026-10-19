import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';

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

const githubConfigured = () =>
  Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.INSIGHTS_GITHUB_USER && process.env.AUTH_SECRET);

/**
 * Cloudflare Access (an emailed one-time code) guards /insights and /api/insights in front of the site.
 * Env: ACCESS_TEAM_DOMAIN (e.g. empty-cake-9a98.cloudflareaccess.com), ACCESS_AUD (the Access app's audience tag),
 * INSIGHTS_EMAIL (the only email allowed). The site checks Cloudflare's signed token itself, so a forged header gets nowhere.
 */
const accessConfigured = () => Boolean(process.env.ACCESS_TEAM_DOMAIN && process.env.ACCESS_AUD && process.env.INSIGHTS_EMAIL);

/** Only in `next dev` on your own computer: INSIGHTS_DEV_USER opens /insights without signing in. Never active on the live site. */
const devUser = () => (process.env.NODE_ENV === 'development' ? process.env.INSIGHTS_DEV_USER || '' : '');

export const authConfigured = () => Boolean(devUser()) || accessConfigured() || githubConfigured();
export const usesAccess = accessConfigured;

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

type Jwk = JsonWebKey & { kid?: string };
let accessKeys: { at: number; keys: Jwk[] } | null = null;
async function accessKey(kid: string) {
  if (!accessKeys || Date.now() - accessKeys.at > 3600e3 || !accessKeys.keys.some((k) => k.kid === kid)) {
    const r = await fetch(`https://${process.env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`, { cache: 'no-store' });
    accessKeys = { at: Date.now(), keys: ((await r.json()) as { keys: Jwk[] }).keys ?? [] };
  }
  return accessKeys.keys.find((k) => k.kid === kid) ?? null;
}

/** The email Cloudflare Access signed in, after checking its token's signature, audience, expiry and the allowed email. */
async function accessUser(): Promise<string | null> {
  const jwt = (await headers()).get('cf-access-jwt-assertion');
  if (!jwt) return null;
  try {
    const [h, p, sig] = jwt.split('.');
    const head = JSON.parse(Buffer.from(h, 'base64url').toString());
    if (head.alg !== 'RS256') return null;
    const jwk = await accessKey(head.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, Buffer.from(sig, 'base64url'), new TextEncoder().encode(`${h}.${p}`));
    if (!ok) return null;
    const c = JSON.parse(Buffer.from(p, 'base64url').toString());
    const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
    if (!aud.includes(process.env.ACCESS_AUD) || typeof c.exp !== 'number' || c.exp < Date.now() / 1000) return null;
    if (c.iss && c.iss !== `https://${process.env.ACCESS_TEAM_DOMAIN}`) return null;
    const email = String(c.email ?? '').toLowerCase();
    return email && email === (process.env.INSIGHTS_EMAIL ?? '').trim().toLowerCase() ? email : null;
  } catch {
    return null;
  }
}

/** The signed-in owner (their email with Cloudflare Access, else their GitHub login), or null. */
export async function currentUser(): Promise<string | null> {
  if (devUser()) return devUser();
  if (accessConfigured()) return accessUser();
  if (!githubConfigured() || !secretStrong()) return null;
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
