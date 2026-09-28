import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { toRange } from '@/lib/umami';
import { getInsights, toSource } from '@/lib/insights-data';
import { buildGeo } from '@/lib/geo';

/** One country's detailed outline and city columns, fetched when the map zooms in. Owner only. */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const code = (req.nextUrl.searchParams.get('code') ?? '').toUpperCase();
  const data = await getInsights(toRange(req.nextUrl.searchParams.get('range') ?? undefined), toSource(req.nextUrl.searchParams.get('source')));
  const detail = buildGeo(data.lists.countries, data.lists.regions, data.lists.cities).countries.find((c) => c.code === code);
  if (!detail) return new NextResponse('Unknown country', { status: 404 });
  return NextResponse.json({ land: detail.land, bars: detail.bars }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
