import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { insightsJson } from '@/lib/insights-api';

/** The dashboard's numbers (lib/insights-api.ts), owner only. On Cloudflare, worker.ts answers this without Next. */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return new NextResponse('Not found', { status: 404 });
  return insightsJson(req.nextUrl, user);
}
