import { NextResponse, type NextRequest } from 'next/server';
import { db, dbConfigured } from '@/lib/db';
import { TIMEZONE, umamiConnected, umamiDay } from '@/lib/umami';

/**
 * Every night (see vercel.json), copy Umami's numbers for recent days into
 * your database, so Umami's history survives even if Umami deletes it or the
 * account is lost. Re-running a day just overwrites it. The first run fills
 * in the last week.
 *
 * Only Vercel's scheduler may run it: with CRON_SECRET set in Vercel it must
 * send that secret; without it, the request must come from Vercel's cron.
 */
export const maxDuration = 60;

/** Start of a calendar day in TIMEZONE, as a timestamp. */
function dayStart(date: string) {
  const guess = Date.parse(`${date}T00:00:00Z`);
  const local = new Date(new Date(guess).toLocaleString('en-US', { timeZone: TIMEZONE }));
  const utc = new Date(new Date(guess).toLocaleString('en-US', { timeZone: 'UTC' }));
  return guess - (local.getTime() - utc.getTime());
}
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
const addDays = (date: string, d: number) => new Date(Date.parse(`${date}T12:00:00Z`) + d * 86400e3).toISOString().slice(0, 10);

function allowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get('authorization') === `Bearer ${secret}`;
  return (req.headers.get('user-agent') ?? '').startsWith('vercel-cron');
}

export async function GET(req: NextRequest) {
  if (!allowed(req)) return new NextResponse('Not found', { status: 404 });
  if (!dbConfigured() || !umamiConnected()) return NextResponse.json({ skipped: 'database or Umami not connected' });

  const [{ n }] = await db(`select count(*) as n from umami_daily`);
  const days = Number(n) === 0 ? 7 : 2;         // first run: last week; then yesterday and the day before
  const end = today();
  const saved: string[] = [];
  const failed: string[] = [];

  for (let i = days; i >= 1; i--) {
    const day = addDays(end, -i);
    try {
      const { totals, lists } = await umamiDay(dayStart(day), dayStart(addDays(day, 1)));
      await db(
        `insert into umami_daily (day, visitors, visits, pageviews, bounces, totaltime, saved_at)
         values ($1,$2,$3,$4,$5,$6, now())
         on conflict (day) do update set visitors = excluded.visitors, visits = excluded.visits, pageviews = excluded.pageviews,
           bounces = excluded.bounces, totaltime = excluded.totaltime, saved_at = now()`,
        [day, totals.visitors, totals.visits, totals.pageviews, totals.bounces, totals.totaltime],
      );
      await db(`delete from umami_daily_lists where day = $1`, [day]);
      const rows = lists.flatMap(({ list, rows: r }) => r.map((row) => [list, row.label ?? '', row.value]));
      if (rows.length) {
        const values = rows.map((_, j) => `($1, $${j * 3 + 2}, $${j * 3 + 3}, $${j * 3 + 4})`).join(',');
        await db(`insert into umami_daily_lists (day, list, label, value) values ${values} on conflict do nothing`, [day, ...rows.flat()]);
      }
      saved.push(day);
    } catch (e) {
      failed.push(`${day}: ${(e as Error).message}`);
    }
  }
  return NextResponse.json({ saved, failed });
}
