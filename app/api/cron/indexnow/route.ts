import { NextResponse, type NextRequest } from 'next/server';
import { indexNow } from '@/lib/jobs';

/** Tells IndexNow about every page, by hand (lib/jobs.ts). Cloudflare's cron runs it through worker.ts. */
function allowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get('authorization') === `Bearer ${secret}`;
  return (req.headers.get('user-agent') ?? '').startsWith('vercel-cron');
}

export async function GET(req: NextRequest) {
  if (!allowed(req)) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(await indexNow());
}
