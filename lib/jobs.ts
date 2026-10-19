import { db, dbConfigured } from './db';
import { TIMEZONE, umamiConnected, umamiDay } from './umami';
import { INDEXNOW_KEY, publicPaths, siteUrl } from './seo';

// The two nightly jobs. worker.ts runs them straight from Cloudflare's cron triggers (no web request, no Next);
// the /api/cron routes run the same code by hand (with CRON_SECRET) or in next dev.

/** Start of a calendar day in TIMEZONE, as a timestamp. */
function dayStart(date: string) {
  const guess = Date.parse(`${date}T00:00:00Z`);
  const local = new Date(new Date(guess).toLocaleString('en-US', { timeZone: TIMEZONE }));
  const utc = new Date(new Date(guess).toLocaleString('en-US', { timeZone: 'UTC' }));
  return guess - (local.getTime() - utc.getTime());
}
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
const addDays = (date: string, d: number) => new Date(Date.parse(`${date}T12:00:00Z`) + d * 86400e3).toISOString().slice(0, 10);

/**
 * Every night (Cloudflare cron trigger: wrangler.jsonc and worker.ts), copy Umami's numbers for recent days into
 * your database, so Umami's history survives even if Umami deletes it or the
 * account is lost. Re-running a day just overwrites it. The first run fills
 * in the last week.
 *
 * Only the scheduler may run it: it must send CRON_SECRET (a Cloudflare secret).
 * Without CRON_SECRET only Vercel's cron is accepted, so on Cloudflare always set it.
 */
export async function umamiBackup() {
  if (!dbConfigured() || !umamiConnected()) return { skipped: 'database or Umami not connected' };

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
  return { saved, failed };
}

/**
 * Tells Bing and the other IndexNow search engines about every public page,
 * once a day (Cloudflare cron trigger, see wrangler.jsonc and worker.ts), so new work shows up there quickly. Google doesn't
 * use IndexNow; it finds the site through links and the sitemap.
 * Only a request that carries CRON_SECRET may run it (the Cloudflare scheduler sends it).
 */
export async function indexNow() {
  const url = siteUrl();
  if (url.startsWith('http://localhost')) return { skipped: 'no public address' };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(url).host,
      key: INDEXNOW_KEY,
      keyLocation: `${url}/${INDEXNOW_KEY}.txt`,
      urlList: publicPaths().map(({ path }) => `${url}${path === '/' ? '' : path}`),
    }),
  });
  return { status: res.status, sent: publicPaths().length };
}
