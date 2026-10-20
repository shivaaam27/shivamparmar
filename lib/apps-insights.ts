import { getInsights } from './insights-data';
import { countryName, labelled } from './insights-format';
import { LISTS, RANGES, toRange, type ListKey } from './insights-shared';

/**
 * The dashboard's numbers for the Shivo Labs apps (the hub on the laptop, the phone app), read through the Shivo Labs
 * shelf on Cloudflare: GET /api/apps/insights?range=7d with `Authorization: Bearer <INSIGHTS_APP_TOKEN>`.
 * Outside /api/insights on purpose: Cloudflare Access guards that, and the shelf has no Access sign-in; the key is
 * the lock here. Labels are already readable (country names, page titles). Without the right key: 404, like the page.
 * Answered by worker.ts without Next, and by app/api/apps/insights for next dev.
 */
const TOP = 25;

function allowed(headers: Headers) {
  const want = process.env.INSIGHTS_APP_TOKEN ?? '';
  const given = (headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (want.length < 32 || given.length !== want.length) return false;
  let d = 0;   // compare without leaking how much matched
  for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ given.charCodeAt(i);
  return d === 0;
}

export async function appsInsightsJson(req: Request): Promise<Response> {
  if (!allowed(req.headers)) return new Response('Not found', { status: 404 });
  const range = toRange(new URL(req.url).searchParams.get('range') ?? undefined);
  const data = await getInsights(range);
  const keys = Object.keys(LISTS) as ListKey[];
  return Response.json({
    site: { name: 'shivolabs.com', url: process.env.SITE_URL || 'https://shivolabs.com' },
    at: Date.now(),
    source: data.source,
    note: data.note ?? null,
    range,
    rangeLabel: RANGES[range].label,
    unit: RANGES[range].unit,
    totals: data.totals,
    previous: data.previous,
    live: data.live,
    liveCountries: data.liveCountries.map((r) => ({ label: countryName(r.label), code: r.label, value: r.value })),
    series: data.series,
    prevSeries: data.prevSeries,
    year: data.year,
    rhythm: data.rhythm,
    // countries keep their two-letter code too (the apps show a flag)
    lists: Object.fromEntries(keys.map((k) => {
      const rows = data.lists[k].slice(0, TOP);
      return [k, labelled(k, rows).map((r, i) => (k === 'countries' ? { ...r, code: rows[i].label } : r))];
    })),
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
