import 'server-only';

/**
 * Reads visit statistics from Umami Cloud for /insights, in one of two ways:
 *  - UMAMI_SHARE_ID (free plan): the id at the end of the website's Share URL.
 *    Umami trades it for a read-only token, the same way its public share page does.
 *  - UMAMI_API_KEY (paid plans): Umami → Settings → API keys.
 * Optional: NEXT_PUBLIC_UMAMI_WEBSITE_ID, INSIGHTS_TIMEZONE.
 * Without either, or if Umami can't be reached, it returns sample data
 * flagged as such so the page never pretends.
 */

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'c8e39f81-6be1-4b1b-a492-801b885b6347';
/** Accepts the bare id or the whole share URL (…/share/<id> or …/share/<id>/<name>). */
function shareIdFrom(raw?: string) {
  const v = raw?.trim();
  if (!v) return undefined;
  const m = v.match(/\/share\/([^/?#]+)/);
  return m ? m[1] : v.replace(/[/?#].*$/, '');
}
const SHARE_ID = shareIdFrom(process.env.UMAMI_SHARE_ID);
const API_KEY = process.env.UMAMI_API_KEY;
const connected = () => Boolean(SHARE_ID || API_KEY);

type Access = { base: string; website: string; headers: Record<string, string> };

/**
 * Umami Cloud answers its share lookup on different hosts depending on its
 * version, so try each until one hands out a token that can actually read
 * this website. The winner is remembered for half an hour.
 */
const SHARE_HOSTS = ['https://api.umami.is/v1', 'https://cloud.umami.is/api', 'https://cloud.umami.is/analytics/api'];
let remembered: { access: Access; until: number } | null = null;
/** What each attempt answered, for /api/insights/status. */
export let shareAttempts: string[] = [];

/** Status plus the start of the body, so a refusal says why. */
async function why(res: Response) {
  const text = (await res.text().catch(() => '')).replace(/\s+/g, ' ').trim();
  return `${res.status}${text ? ` ${text.startsWith('<') ? '(web page)' : text.slice(0, 160)}` : ''}`;
}

async function access(): Promise<Access> {
  if (API_KEY) return { base: 'https://api.umami.is/v1', website: WEBSITE_ID, headers: { 'x-umami-api-key': API_KEY } };
  if (remembered && remembered.until > Date.now()) return remembered.access;
  const attempts: string[] = [];
  // Umami's own share page asks with an empty bearer, and sends the share
  // context header with every request that uses the token (without it the token is refused).
  const ask = { Accept: 'application/json', authorization: 'Bearer ', 'x-umami-share-context': '1' };
  for (const base of SHARE_HOSTS) {
    try {
      const res = await fetch(`${base}/share/${SHARE_ID}`, { cache: 'no-store', headers: ask });
      if (!res.ok) { attempts.push(`${base}/share → ${await why(res)}`); continue; }
      const j = (await res.json()) as { token?: string; websiteId?: string; website?: { id?: string }; data?: { websiteId?: string } };
      if (!j.token) { attempts.push(`${base}/share → no token in answer`); continue; }
      const found: Access = {
        base,
        website: j.websiteId ?? j.website?.id ?? j.data?.websiteId ?? WEBSITE_ID,
        headers: { 'x-umami-share-token': j.token, 'x-umami-share-context': '1' },
      };
      // make sure the token can read stats on this host before trusting it
      const probe = await fetch(`${base}/websites/${found.website}/active`, { cache: 'no-store', headers: { ...found.headers, Accept: 'application/json' } });
      if (!probe.ok) { attempts.push(`${base}/share → token ok, reading stats → ${await why(probe)}`); continue; }
      attempts.push(`${base} → connected`);
      shareAttempts = attempts;
      remembered = { access: found, until: Date.now() + 30 * 60e3 };
      return found;
    } catch (e) {
      attempts.push(`${base} → ${(e as Error).message}`);
    }
  }
  shareAttempts = attempts;
  throw new Error(`share link not accepted (${attempts.join('; ')})`);
}
export const TIMEZONE = process.env.INSIGHTS_TIMEZONE || 'Africa/Dar_es_Salaam';

export const RANGES = {
  '24h': { label: 'Last 24 hours', short: '24 hours', unit: 'hour', ms: 24 * 3600e3 },
  '7d': { label: 'Last 7 days', short: '7 days', unit: 'day', ms: 7 * 86400e3 },
  '30d': { label: 'Last 30 days', short: '30 days', unit: 'day', ms: 30 * 86400e3 },
  '90d': { label: 'Last 90 days', short: '90 days', unit: 'day', ms: 90 * 86400e3 },
  '12m': { label: 'Last 12 months', short: '12 months', unit: 'month', ms: 365 * 86400e3 },
} as const;
export type RangeKey = keyof typeof RANGES;
export const toRange = (v?: string | string[]): RangeKey => (typeof v === 'string' && v in RANGES ? (v as RangeKey) : '30d');

export type Row = { label: string; value: number };
export type Totals = { visitors: number; visits: number; pageviews: number; bounceRate: number; avgVisit: number };
export type Point = { t: number; visitors: number; pageviews: number };

export const LISTS = {
  pages: 'Pages',
  entries: 'Entry pages',
  referrers: 'Where visitors come from',
  countries: 'Countries',
  regions: 'Regions',
  cities: 'Cities',
  devices: 'Devices',
  browsers: 'Browsers',
  os: 'Operating systems',
  screens: 'Screen sizes',
  languages: 'Languages',
  events: 'Actions',
} as const;
export type ListKey = keyof typeof LISTS;

/** One day of the last 12 months (for the skyline). */
export type Day = { t: number; visitors: number };

export type Insights = {
  source: 'umami' | 'sample';
  note?: string;
  range: RangeKey;
  totals: Totals;
  previous: Totals;
  live: number;
  series: Point[];
  /** The previous period, bucket for bucket, for the comparison line. */
  prevSeries: Point[];
  /** Daily visitors for the last 365 days, oldest first (independent of range). */
  year: Day[];
  /** Page views by weekday (0 = Monday) × hour (0–23) over the last 4 weeks (independent of range). */
  rhythm: number[][];
  lists: Record<ListKey, Row[]>;
};

/* ---------------------------------------------------------------- Umami */

async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const { base, website, headers } = await access();
  const url = new URL(`${base}/websites/${website}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, {
    headers: { ...headers, Accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Umami ${path} answered ${res.status}`);
  return res.json() as Promise<T>;
}

type Stat = number | { value: number; prev?: number };
type StatsV = Record<'pageviews' | 'visitors' | 'visits' | 'bounces' | 'totaltime', Stat> & {
  comparison?: Record<'pageviews' | 'visitors' | 'visits' | 'bounces' | 'totaltime', number>;
};

const now = (s: Stat) => (typeof s === 'number' ? s : s?.value ?? 0);
function toTotals(v: Record<string, number>): Totals {
  const visits = v.visits || 0;
  return {
    visitors: v.visitors || 0,
    visits,
    pageviews: v.pageviews || 0,
    bounceRate: visits ? Math.min(1, (v.bounces || 0) / visits) : 0,
    avgVisit: visits ? (v.totaltime || 0) / visits : 0,
  };
}

// metric type names differ between Umami versions ("path" is newer, "url" older)
const METRIC: Record<ListKey, string[]> = {
  pages: ['path', 'url'], entries: ['entry'], referrers: ['referrer'], countries: ['country'], regions: ['region'],
  cities: ['city'], devices: ['device'], browsers: ['browser'], os: ['os'], screens: ['screen'], languages: ['language'], events: ['event'],
};

async function metric(key: ListKey, startAt: number, endAt: number): Promise<Row[]> {
  for (const type of METRIC[key]) {
    try {
      const rows = await get<{ x: string | null; y: number }[]>('/metrics', { startAt, endAt, type, limit: 50 });
      return rows.map((r) => ({ label: r.x ?? '', value: r.y }));
    } catch { /* try the next name */ }
  }
  return [];
}

async function fromUmami(range: RangeKey): Promise<Insights> {
  const { ms, unit } = RANGES[range];
  const endAt = Date.now();
  const startAt = endAt - ms;

  type Views = { pageviews: { x: string; y: number }[]; sessions: { x: string; y: number }[] };
  const views = (from: number, to: number, u: string) => get<Views>('/pageviews', { startAt: from, endAt: to, unit: u, timezone: TIMEZONE });
  const yearStart = endAt - 365 * 86400e3;
  const rhythmStart = endAt - 28 * 86400e3;

  const [stats, prevStats, active, cur, before, yearViews, hourViews, ...lists] = await Promise.all([
    get<StatsV>('/stats', { startAt, endAt }),
    get<StatsV>('/stats', { startAt: startAt - ms, endAt: startAt }),
    get<{ visitors?: number; x?: number }>('/active', {}).catch((): { visitors?: number; x?: number } => ({ visitors: 0 })),
    views(startAt, endAt, unit),
    views(startAt - ms, startAt, unit).catch((): Views => ({ pageviews: [], sessions: [] })),
    views(yearStart, endAt, 'day').catch((): Views => ({ pageviews: [], sessions: [] })),
    views(rhythmStart, endAt, 'hour').catch((): Views => ({ pageviews: [], sessions: [] })),
    ...(Object.keys(LISTS) as ListKey[]).map((k) => metric(k, startAt, endAt)),
  ]);

  const flat = (s: StatsV) => Object.fromEntries((['pageviews', 'visitors', 'visits', 'bounces', 'totaltime'] as const).map((k) => [k, now(s[k])]));
  return {
    source: 'umami',
    range,
    totals: toTotals(flat(stats)),
    previous: toTotals(flat(prevStats)),
    live: active.visitors ?? active.x ?? 0,
    series: fillSeries(unit, startAt, endAt, cur.sessions, cur.pageviews),
    prevSeries: fillSeries(unit, startAt - ms, startAt, before.sessions, before.pageviews),
    year: fillSeries('day', yearStart, endAt, yearViews.sessions, yearViews.pageviews).map((p) => ({ t: p.t, visitors: p.visitors })),
    rhythm: toRhythm(hourViews.pageviews),
    lists: Object.fromEntries((Object.keys(LISTS) as ListKey[]).map((k, i) => [k, lists[i]])) as Record<ListKey, Row[]>,
  };
}

/** Umami only returns buckets that had visits; lay out every bucket so gaps read as zero. */
function fillSeries(unit: 'hour' | 'day' | 'month', startAt: number, endAt: number, sessions: { x: string; y: number }[], pageviews: { x: string; y: number }[]): Point[] {
  const key = (d: Date) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).map((x) => [x.type, x.value]));
    return unit === 'hour' ? `${p.year}-${p.month}-${p.day} ${p.hour}` : unit === 'day' ? `${p.year}-${p.month}-${p.day}` : `${p.year}-${p.month}`;
  };
  const trim = (x: string) => x.replace('T', ' ').slice(0, unit === 'hour' ? 13 : unit === 'day' ? 10 : 7);
  const v = new Map(sessions.map((r) => [trim(r.x), r.y]));
  const p = new Map(pageviews.map((r) => [trim(r.x), r.y]));
  const out: Point[] = [];
  const seen = new Set<string>();
  const step = unit === 'hour' ? 3600e3 : 86400e3;
  for (let t = startAt; t <= endAt; t += step) {
    const k = key(new Date(t));
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ t, visitors: v.get(k) ?? 0, pageviews: p.get(k) ?? 0 });
  }
  return out;
}

/** Hourly buckets ("2026-09-28 14:00:00", already in TIMEZONE) → weekday × hour totals. */
function toRhythm(rows: { x: string; y: number }[]): number[][] {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  rows.forEach(({ x, y }) => {
    const [date, time = '00'] = x.replace('T', ' ').split(' ');
    const [yy, mm, dd] = date.split('-').map(Number);
    const weekday = (new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay() + 6) % 7;
    grid[weekday][Number(time.slice(0, 2)) || 0] += y;
  });
  return grid;
}

/* --------------------------------------------------------------- sample */

/** Plausible, fixed sample numbers so the page can be designed and reviewed before real data exists. */
function sample(range: RangeKey, note: string): Insights {
  const { ms, unit } = RANGES[range];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const endAt = Date.now();
  const n = unit === 'hour' ? 24 : unit === 'month' ? 12 : Math.round(ms / 86400e3);
  const step = unit === 'hour' ? 3600e3 : unit === 'month' ? 30.4 * 86400e3 : 86400e3;
  const base = unit === 'hour' ? 2 : unit === 'month' ? 600 : 22;
  const series: Point[] = Array.from({ length: n }, (_, i) => {
    const wave = 1 + 0.35 * Math.sin(i / 2.2) + 0.25 * (i / n);
    const visitors = Math.round(base * wave * (0.7 + rnd() * 0.6));
    return { t: endAt - (n - 1 - i) * step, visitors, pageviews: Math.round(visitors * (2.1 + rnd() * 0.9)) };
  });
  const visitors = series.reduce((s, p) => s + p.visitors, 0);
  const pageviews = series.reduce((s, p) => s + p.pageviews, 0);
  const totals: Totals = { visitors, visits: Math.round(visitors * 1.18), pageviews, bounceRate: 0.41, avgVisit: 102 };
  const previous: Totals = { visitors: Math.round(visitors * 0.86), visits: Math.round(visitors * 1.02), pageviews: Math.round(pageviews * 0.8), bounceRate: 0.46, avgVisit: 88 };
  const prevSeries = series.map((p) => ({ t: p.t - ms, visitors: Math.round(p.visitors * (0.7 + rnd() * 0.35)), pageviews: Math.round(p.pageviews * (0.7 + rnd() * 0.3)) }));
  // a year that starts quiet and picks up, with weekday rhythm and a few spikes
  const year: Day[] = Array.from({ length: 365 }, (_, i) => {
    const t = endAt - (364 - i) * 86400e3;
    const weekday = new Date(t).getUTCDay();
    const growth = 0.25 + (i / 364) * 0.9;
    const spike = rnd() > 0.965 ? 2.6 + rnd() * 2 : 1;
    const quiet = rnd() < 0.12 ? 0 : 1;
    return { t, visitors: Math.round(quiet * spike * growth * (weekday === 0 || weekday === 6 ? 9 : 17) * (0.55 + rnd() * 0.9)) };
  });
  const rhythm = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
    const day = Math.exp(-((h - 11) ** 2) / 18) + 0.7 * Math.exp(-((h - 20) ** 2) / 10);
    return Math.round((d >= 5 ? 5 : 11) * day * (0.6 + rnd() * 0.8));
  }));
  const scale = (rows: [string, number][]) => rows.map(([label, share]) => ({ label, value: Math.max(1, Math.round(visitors * share)) }));
  return {
    source: 'sample',
    note,
    range,
    totals,
    previous,
    live: 3,
    series,
    prevSeries,
    year,
    rhythm,
    lists: {
      pages: scale([['/', 0.92], ['/work/task-management', 0.31], ['/about', 0.22], ['/work/files-management', 0.14]]),
      entries: scale([['/', 0.81], ['/work/task-management', 0.11], ['/about', 0.05]]),
      referrers: scale([['', 0.38], ['google.com', 0.21], ['linkedin.com', 0.17], ['instagram.com', 0.13], ['github.com', 0.06], ['wa.me', 0.05]]),
      countries: scale([['TZ', 0.34], ['IN', 0.21], ['KE', 0.1], ['GB', 0.08], ['US', 0.07], ['AE', 0.06], ['ZA', 0.04], ['DE', 0.03], ['CA', 0.02], ['AU', 0.02]]),
      regions: scale([['TZ-02', 0.27], ['IN-MH', 0.12], ['KE-110', 0.08], ['GB-ENG', 0.07], ['TZ-01', 0.05]]),
      cities: scale([['Dar es Salaam', 0.27], ['Mumbai', 0.11], ['Nairobi', 0.08], ['London', 0.07], ['Arusha', 0.05], ['Dubai', 0.05], ['Ahmedabad', 0.04]]),
      devices: scale([['mobile', 0.58], ['desktop', 0.36], ['tablet', 0.06]]),
      browsers: scale([['chrome', 0.52], ['ios', 0.24], ['safari', 0.1], ['edge-chromium', 0.07], ['samsung', 0.04], ['firefox', 0.03]]),
      os: scale([['Android OS', 0.38], ['iOS', 0.27], ['Windows 10', 0.2], ['Mac OS', 0.12], ['Linux', 0.03]]),
      screens: scale([['390x844', 0.21], ['1920x1080', 0.17], ['412x915', 0.13], ['1440x900', 0.09], ['1536x864', 0.07]]),
      languages: scale([['en-US', 0.44], ['en-GB', 0.19], ['sw-TZ', 0.13], ['en-IN', 0.12], ['hi-IN', 0.05]]),
      events: scale([['Filter · Systems', 0.24], ['Open project · Task Management', 0.19], ['Read about to the end', 0.17], ['Filter · Photography', 0.09],
        ['Filter · Systems › Dashboards', 0.08], ['Open project · Files Management', 0.07], ['Contact · Email', 0.05], ['Filter · All work', 0.04]]),
    },
  };
}

/* ------------------------------------------------------------------ api */

/** For the status check: which credential is set, and does Umami answer. */
export async function umamiStatus() {
  const via = API_KEY ? 'api key' : SHARE_ID ? 'share link' : 'not set';
  if (!connected()) return { via, ok: false, detail: 'Add UMAMI_SHARE_ID in Vercel' };
  remembered = null; // always re-check here
  // show the id we read (first and last characters only), so a wrong value is easy to spot
  const shareId = SHARE_ID ? `${SHARE_ID.slice(0, 3)}…${SHARE_ID.slice(-2)} (${SHARE_ID.length} characters)` : undefined;
  try {
    const now = Date.now();
    const s = await get<Record<string, unknown>>('/stats', { startAt: now - 86400e3, endAt: now });
    return { via, shareId, ok: true, detail: `Umami answered; last 24h visitors: ${JSON.stringify(s.visitors)}`, attempts: shareAttempts };
  } catch (e) {
    return { via, shareId, ok: false, detail: (e as Error).message, attempts: shareAttempts };
  }
}

export async function getInsights(range: RangeKey): Promise<Insights> {
  if (!connected()) return sample(range, 'Sample data. Add UMAMI_SHARE_ID in Vercel to see your real numbers.');
  try {
    return await fromUmami(range);
  } catch (e) {
    return sample(range, `Couldn't reach Umami (${(e as Error).message}), so this is sample data. Check UMAMI_SHARE_ID in Vercel.`);
  }
}
