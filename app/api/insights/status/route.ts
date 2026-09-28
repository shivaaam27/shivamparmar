import { NextResponse } from 'next/server';
import { currentUser, secretStrong } from '@/lib/auth';
import { discoverShareApi, umamiStatus } from '@/lib/umami';

/** Owner-only setup check: open /api/insights/status after signing in. No secret values are shown. */
export async function GET() {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const set = (k: string) => Boolean(process.env[k]);
  return NextResponse.json({
    signIn: { GITHUB_CLIENT_ID: set('GITHUB_CLIENT_ID'), GITHUB_CLIENT_SECRET: set('GITHUB_CLIENT_SECRET'), INSIGHTS_GITHUB_USER: set('INSIGHTS_GITHUB_USER'), AUTH_SECRET: set('AUTH_SECRET') },
    tracking: { websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? 'from Vercel' : 'built-in default', countOnlyDomains: process.env.NEXT_PUBLIC_UMAMI_DOMAINS || 'any domain' },
    authSecretStrong: secretStrong(),
    umami: await umamiStatus(),
    umamiSharePage: await discoverShareApi(),
    deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
