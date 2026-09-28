import { NextResponse, type NextRequest } from 'next/server';
import { MIN_SECRET, SESSION_COOKIE, STATE_COOKIE, allowedUser, authConfigured, cookieBase, createSession, secretStrong } from '@/lib/auth';

const notFound = () => new NextResponse('Not found', { status: 404 });
/** Setup problems get a plain explanation; only "not the owner" stays a silent 404. */
const problem = (text: string) =>
  new NextResponse(`${text}\n\nTry again: /insights`, { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

/**
 * Step 2: GitHub sends the browser back with a code. Check the state, swap
 * the code for a token, ask GitHub who this is, and only let the owner in.
 * Anyone else gets a plain 404 and no cookie.
 */
export async function GET(req: NextRequest) {
  if (!authConfigured()) return notFound();
  if (!secretStrong()) {
    return problem(`AUTH_SECRET in Vercel is too weak to protect your sign-in. Set it to a random value of at least ${MIN_SECRET} characters `
      + '(a password manager can generate one), then redeploy.');
  }
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const expected = req.cookies.get(STATE_COOKIE)?.value;
  const ghError = req.nextUrl.searchParams.get('error_description') ?? req.nextUrl.searchParams.get('error');
  if (ghError) return problem(`GitHub stopped the sign-in: ${ghError}`);
  if (!code || !state || !expected || state !== expected) {
    return problem('The sign-in link expired or was opened in a different browser. Start again from /insights.');
  }

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
  const tokenJson = await tokenRes.json().catch(() => null);
  const token = tokenJson?.access_token as string | undefined;
  if (!token) {
    return problem(`GitHub didn't accept the sign-in (${tokenJson?.error_description ?? tokenJson?.error ?? tokenRes.status}). `
      + 'Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel, and that the app\'s callback URL is '
      + new URL('/api/auth/github/callback', req.nextUrl.origin).toString());
  }

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
