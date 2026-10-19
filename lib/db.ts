import 'server-only';
import { neon } from '@neondatabase/serverless';

/**
 * Your own copy of the visit data, in the Neon Postgres database
 * (DATABASE_URL, a Cloudflare secret). Tables are created on first use.
 *
 *  visits_events  one row per page view or action, recorded by /api/collect
 *  umami_daily    Umami's daily totals, copied every night by /api/cron/umami-backup
 *  umami_daily_lists  Umami's daily top lists (countries, pages, …) for the same days
 */

export type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
export const dbConfigured = () => Boolean(url());

let override: Query | null = null;
/** Tests plug in a local Postgres here. */
export function setTestQuery(q: Query | null) { override = q; ready = null; }

function raw(): Query {
  if (override) return override;
  const sql = neon(url());
  return (text, params = []) => sql.query(text, params) as Promise<Record<string, unknown>[]>;
}

const SCHEMA = [
  `create table if not exists visits_events (
     id bigserial primary key,
     ts timestamptz not null default now(),
     kind text not null,                 -- 'pageview' or 'event'
     name text,                          -- the action, for events
     path text not null,
     referrer text,                      -- host of the page they came from
     country text, region text, city text,
     device text, browser text, os text, screen text, language text,
     visitor text not null,              -- anonymous, changes every day
     session text not null               -- one browser tab's visit
   )`,
  `create index if not exists visits_events_ts on visits_events (ts)`,
  `create index if not exists visits_events_session on visits_events (session, ts)`,
  // the network each visit came from, and whether it looks like a robot (lib/robots.ts)
  `alter table visits_events add column if not exists asn integer`,
  `alter table visits_events add column if not exists network text`,
  `alter table visits_events add column if not exists robot boolean not null default false`,
  // what the dashboard counts: people only
  `create or replace view visits_people as select * from visits_events where not robot`,
  `create table if not exists umami_daily (
     day date primary key,
     visitors int not null, visits int not null, pageviews int not null,
     bounces int not null, totaltime int not null,
     saved_at timestamptz not null default now()
   )`,
  `create table if not exists umami_daily_lists (
     day date not null, list text not null, label text not null, value int not null,
     primary key (day, list, label)
   )`,
];

let ready: Promise<void> | null = null;
function ensureSchema(q: Query) {
  ready ??= (async () => { for (const s of SCHEMA) await q(s); })().catch((e) => { ready = null; throw e; });
  return ready;
}

/** Run a query, creating the tables first if needed. */
export async function db(text: string, params: unknown[] = []) {
  const q = raw();
  await ensureSchema(q);
  return q(text, params);
}
