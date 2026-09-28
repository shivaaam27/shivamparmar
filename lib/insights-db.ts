import 'server-only';
import { db } from './db';
import { LISTS, RANGES, TIMEZONE, fillSeries, toRhythm, toTotals, type Insights, type ListKey, type RangeKey, type Row } from './umami';

/**
 * The dashboard's numbers, computed from this site's own database
 * (visits_events). Shapes match what Umami gives, so every chart works
 * from either source.
 */

const n = (v: unknown) => Number(v ?? 0) || 0;
const iso = (t: number) => new Date(t).toISOString();

type Bucket = { x: string; y: number };

async function totals(from: number, to: number) {
  const [r] = await db(
    `with ev as (select * from visits_events where ts >= $1 and ts < $2),
          sess as (select session, count(*) filter (where kind = 'pageview') as views,
                          extract(epoch from max(ts) - min(ts)) as dur
                   from ev group by session)
     select (select count(distinct visitor) from ev where kind = 'pageview') as visitors,
            (select count(*) from sess where views > 0) as visits,
            (select count(*) from ev where kind = 'pageview') as pageviews,
            (select count(*) from sess where views = 1) as bounces,
            (select coalesce(sum(dur), 0) from sess where views > 0) as totaltime`,
    [iso(from), iso(to)],
  );
  return toTotals({ visitors: n(r?.visitors), visits: n(r?.visits), pageviews: n(r?.pageviews), bounces: n(r?.bounces), totaltime: n(r?.totaltime) });
}

/** Visitors and page views per hour / day / month, in the dashboard's timezone. */
async function buckets(unit: 'hour' | 'day' | 'month', from: number, to: number) {
  const rows = await db(
    `select to_char(date_trunc($3, ts at time zone $4), 'YYYY-MM-DD HH24:MI:SS') as x,
            count(distinct visitor) as v, count(*) as p
     from visits_events where kind = 'pageview' and ts >= $1 and ts < $2
     group by 1 order by 1`,
    [iso(from), iso(to), unit, TIMEZONE],
  );
  const visitors: Bucket[] = rows.map((r) => ({ x: String(r.x), y: n(r.v) }));
  const pageviews: Bucket[] = rows.map((r) => ({ x: String(r.x), y: n(r.p) }));
  return { visitors, pageviews };
}

/** Columns a list may group by (never taken from user input). */
const COLUMN: Partial<Record<ListKey, string>> = {
  referrers: 'referrer', countries: 'country', regions: 'region', cities: 'city', devices: 'device',
  browsers: 'browser', os: 'os', screens: 'screen', languages: 'language',
};

async function list(key: ListKey, from: number, to: number): Promise<Row[]> {
  const p = [iso(from), iso(to)];
  const rows =
    key === 'pages' ? await db(`select path as label, count(*) as value from visits_events where kind = 'pageview' and ts >= $1 and ts < $2 group by 1 order by 2 desc limit 50`, p)
    : key === 'entries' ? await db(
      `select path as label, count(*) as value from (
         select distinct on (session) path from visits_events where kind = 'pageview' and ts >= $1 and ts < $2 order by session, ts
       ) first group by 1 order by 2 desc limit 50`, p)
    : key === 'events' ? await db(`select name as label, count(*) as value from visits_events where kind = 'event' and ts >= $1 and ts < $2 group by 1 order by 2 desc limit 50`, p)
    : await db(`select coalesce(${COLUMN[key]}, '') as label, count(distinct visitor) as value from visits_events where kind = 'pageview' and ts >= $1 and ts < $2 group by 1 order by 2 desc limit 50`, p);
  return rows.map((r) => ({ label: String(r.label ?? ''), value: n(r.value) }));
}

export async function fromDb(range: RangeKey): Promise<Insights> {
  const { ms, unit } = RANGES[range];
  const endAt = Date.now();
  const startAt = endAt - ms;
  const yearStart = endAt - 365 * 86400e3;
  const rhythmStart = endAt - 28 * 86400e3;
  const keys = Object.keys(LISTS) as ListKey[];

  const [now, before, cur, prev, year, hours, live, liveBy, ...lists] = await Promise.all([
    totals(startAt, endAt),
    totals(startAt - ms, startAt),
    buckets(unit, startAt, endAt),
    buckets(unit, startAt - ms, startAt),
    buckets('day', yearStart, endAt),
    buckets('hour', rhythmStart, endAt),
    db(`select count(distinct session) as n from visits_events where ts > now() - interval '5 minutes'`),
    db(`select coalesce(country, '') as label, count(distinct session) as value from visits_events where ts > now() - interval '5 minutes' group by 1 order by 2 desc`),
    ...keys.map((k) => list(k, startAt, endAt)),
  ]);

  return {
    source: 'own',
    range,
    totals: now,
    previous: before,
    live: n(live[0]?.n),
    series: fillSeries(unit, startAt, endAt, cur.visitors, cur.pageviews),
    prevSeries: fillSeries(unit, startAt - ms, startAt, prev.visitors, prev.pageviews),
    year: fillSeries('day', yearStart, endAt, year.visitors, year.pageviews).map((p) => ({ t: p.t, visitors: p.visitors })),
    rhythm: toRhythm(hours.pageviews),
    hourly: fillSeries('hour', rhythmStart, endAt, hours.visitors, hours.pageviews),
    liveCountries: liveBy.map((r) => ({ label: String(r.label), value: n(r.value) })),
    lists: Object.fromEntries(keys.map((k, i) => [k, lists[i]])) as Insights['lists'],
  };
}

/** For the status page: is the database there, and what's in it. */
export async function dbStatus() {
  const [e] = await db(`select count(*) as events, max(ts) as last from visits_events`);
  const [u] = await db(`select count(*) as days, to_char(max(day), 'YYYY-MM-DD') as last from umami_daily`);
  return {
    recordedEvents: n(e?.events),
    lastRecorded: e?.last ? new Date(String(e.last)).toISOString() : null,
    umamiDaysBackedUp: n(u?.days),
    lastUmamiBackup: u?.last ? String(u.last) : null,
  };
}
