import { NextResponse, type NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { currentUser } from '@/lib/auth';
import { LISTS, toRange, type ListKey } from '@/lib/umami';
import { getInsights, toSource } from '@/lib/insights-data';
import { labelled, setRegionNames, toCsv } from '@/lib/insights-format';

/** CSV download of one list, owner only: /api/insights/export?list=countries&range=30d */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const list = req.nextUrl.searchParams.get('list') as ListKey;
  if (!(list in LISTS)) return new NextResponse('Unknown list', { status: 400 });
  const range = toRange(req.nextUrl.searchParams.get('range') ?? undefined);
  const data = await getInsights(range, toSource(req.nextUrl.searchParams.get('source')));
  if (list === 'regions') {   // region names come from the file built with the site (public/geo/regions.json)
    const url = new URL('/geo/regions.json', req.url);
    let assets: { fetch: (u: URL) => Promise<Response> } | undefined;
    try { assets = (getCloudflareContext().env as { ASSETS?: typeof assets }).ASSETS; } catch { /* next dev */ }
    const r = await (assets ? assets.fetch(url) : fetch(url)).catch(() => null);
    if (r?.ok) setRegionNames(await r.json());
  }
  const csv = toCsv(list, labelled(list, data.lists[list]), LISTS[list]);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="insights-${list}-${range}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
