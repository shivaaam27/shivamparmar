import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, STATE_COOKIE, allowedUser, authConfigured, cookieBase, createSession } from '@/lib/auth';

const notFound = () => new NextResponse('Not found', { status: 404 });

/**
 * Step 2: GitHub sends the browser back with a code. Check the state, swap
 * the code for a token, ask GitHub who this is, and only let the owner in.
 * Anyone else gets a plain 404 and no cookie.
 */
export async function GET(req: NextRequest) {
  if (!authConfigured()) return notFound();
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const expected = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !expected || state !== expected) return notFound();

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/api/auth/github/callback', req.nextUrl.origin).toString(),
    }),
    cache: 'no-store',
  });
  const token = (await tokenRes.json().catch(() => null))?.access_token as string | undefined;
  if (!token) return notFound();

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'shivamparmar-insights' },
    cache: 'no-store',
  });
  const login = ((await userRes.json().catch(() => null))?.login as string | undefined)?.toLowerCase();
  if (!login || login !== allowedUser()) return notFound();

  const session = createSession(login);
  const res = NextResponse.redirect(new URL('/insights', req.nextUrl.origin));
  res.cookies.set(SESSION_COOKIE, session.value, { ...cookieBase, maxAge: session.maxAge });
  res.cookies.delete(STATE_COOKIE);
  return res;
}
