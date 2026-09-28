import { NextResponse, type NextRequest } from 'next/server';
import { STATE_COOKIE, authConfigured, cookieBase, newState } from '@/lib/auth';

/** Step 1: send the browser to GitHub, remembering a one-time state value. */
export function GET(req: NextRequest) {
  if (!authConfigured()) return new NextResponse('Not found', { status: 404 });
  const state = newState();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
  url.searchParams.set('redirect_uri', new URL('/api/auth/github/callback', req.nextUrl.origin).toString());
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  url.searchParams.set('allow_signup', 'false');
  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, { ...cookieBase, maxAge: 600 });
  return res;
}
