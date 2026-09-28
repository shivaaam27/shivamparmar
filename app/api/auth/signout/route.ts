import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

/** Sign out: clear the session cookie and return to the home page. */
export function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.nextUrl.origin), { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
