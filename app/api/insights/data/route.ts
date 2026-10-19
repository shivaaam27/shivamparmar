import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { TIMEZONE, toRange } from '@/lib/umami';
import { defaultSource, getInsights, toSource } from '@/lib/insights-data';

/**
 * The dashboard's numbers as JSON, owner only: /api/insights/data?range=30d&source=own.
 * Only database and Umami reads happen here (waiting on them costs no computer time);
 * the page draws everything in the browser, so this stays well inside Cloudflare's free limits.
 */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const q = req.nextUrl.searchParams;
  const source = toSource(q.get('source')) ?? defaultSource();
  const data = await getInsights(toRange(q.get('range') ?? undefined), source);
  return NextResponse.json({ data, timeZone: TIMEZONE, defaultSource: defaultSource() }, { headers: { 'Cache-Control': 'private, no-store' } });
}
