import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { LISTS, getInsights, toRange, type ListKey } from '@/lib/umami';
import { labelled, toCsv } from '@/lib/insights-format';

/** CSV download of one list, owner only: /api/insights/export?list=countries&range=30d */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const list = req.nextUrl.searchParams.get('list') as ListKey;
  if (!(list in LISTS)) return new NextResponse('Unknown list', { status: 400 });
  const range = toRange(req.nextUrl.searchParams.get('range') ?? undefined);
  const data = await getInsights(range);
  const csv = toCsv(list, labelled(list, data.lists[list]), LISTS[list]);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="insights-${list}-${range}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
