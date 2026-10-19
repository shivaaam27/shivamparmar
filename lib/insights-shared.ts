/**
 * The parts of /insights that both the server (data) and the browser (the dashboard) use:
 * the date ranges, the lists, and the shape of the numbers. No secrets and no server code here.
 */

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
  /** 'own' = this site's database, 'umami' = Umami Cloud, 'sample' = made-up numbers */
  source: 'own' | 'umami' | 'sample';
  note?: string;
  range: RangeKey;
  totals: Totals;
  previous: Totals;
  live: number;
  /** Visitors from data centres (robots running a browser) in the range, left out of everything else (own database only). */
  robots?: number;
  series: Point[];
  /** The previous period, bucket for bucket, for the comparison line. */
  prevSeries: Point[];
  /** Daily visitors for the last 365 days, oldest first (independent of range). */
  year: Day[];
  /** Page views by weekday (0 = Monday) × hour (0–23) over the last 4 weeks (independent of range). */
  rhythm: number[][];
  /** Visitors and page views hour by hour over the last 4 weeks (independent of range). */
  hourly: Point[];
  /** Countries of people on the site in the last 5 minutes (own database only). */
  liveCountries: Row[];
  lists: Record<ListKey, Row[]>;
};

export type Source = 'own' | 'umami';
