import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/auth';
import { countryOutline } from '@/lib/geo';

/** A country's detailed outline for the map's zoomed-in view. Owner only. */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('Not found', { status: 404 });
  const code = (req.nextUrl.searchParams.get('code') ?? '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return new NextResponse('Unknown country', { status: 400 });
  return NextResponse.json({ d: countryOutline(code) }, { headers: { 'Cache-Control': 'private, max-age=86400' } });
}
