import { TIMEZONE, toRange } from './umami';
import { defaultSource, getInsights, toSource } from './insights-data';

/**
 * The dashboard's numbers as JSON for a signed-in owner: /api/insights/data?range=30d&source=own.
 * Only database and Umami reads (waiting on them costs no computer time). Used by worker.ts, which answers it
 * without starting Next, and by the Next route for next dev.
 */
export async function insightsJson(url: URL, user: string): Promise<Response> {
  const q = url.searchParams;
  const source = toSource(q.get('source')) ?? defaultSource();
  const data = await getInsights(toRange(q.get('range') ?? undefined), source);
  return Response.json({ data, timeZone: TIMEZONE, defaultSource: defaultSource(), user }, { headers: { 'Cache-Control': 'private, no-store' } });
}
