import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { authConfigured, currentUser } from '@/lib/auth';
import { LISTS, RANGES, TIMEZONE, getInsights, toRange, type ListKey, type RangeKey, type Row, type Totals } from '@/lib/umami';
import { duration, fmt, label, pct, unitOf } from '@/lib/insights-format';
import TrendChart from '@/components/insights/TrendChart';
import WorldMap from '@/components/insights/WorldMap';
import ExcludeMe from '@/components/insights/ExcludeMe';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Insights', robots: { index: false, follow: false, nocache: true } };

type Props = { searchParams: Promise<{ range?: string }> };

export default async function InsightsPage({ searchParams }: Props) {
  if (!authConfigured()) notFound();
  const user = await currentUser();
  if (!user) return <SignIn />;

  const range = toRange((await searchParams).range);
  const data = await getInsights(range);
  const { lists } = data;
  const since = `vs previous ${RANGES[range].short}`;

  // derived views of the raw lists
  const projects = lists.pages.filter((r) => r.label.startsWith('/work/'));
  const contact = lists.events.filter((r) => r.label.startsWith('Contact · ')).map((r) => ({ ...r, label: r.label.replace('Contact · ', '') }));
  const activity = lists.events.filter((r) => !r.label.startsWith('Contact · '));

  return (
    <main id="main" className="insights">
      <header className="insights__top">
        <a className="wordmark" href="/">Shivam</a>
        <div className="insights__who mono">
          <span>Signed in as @{user}</span>
          <form action="/api/auth/signout" method="post"><button type="submit">Sign out</button></form>
        </div>
      </header>

      <section className="insights__intro">
        <h1 className="display">Insights</h1>
        <p className="insights__live mono"><i aria-hidden="true" />{data.live} {data.live === 1 ? 'person' : 'people'} on the site now</p>
      </section>

      {data.note && <p className="insights__note" role="note">{data.note}</p>}

      <nav className="insights__ranges" aria-label="Date range">
        {(Object.keys(RANGES) as RangeKey[]).map((k) => (
          <a key={k} href={`/insights?range=${k}`} aria-current={k === range ? 'true' : undefined}>{RANGES[k].label}</a>
        ))}
      </nav>

      <section className="insights__kpis" aria-label="Summary">
        <Kpi hero label="Visitors" value={fmt(data.totals.visitors)} delta={change(data.totals, data.previous, 'visitors')} since={since} />
        <Kpi label="Visits" value={fmt(data.totals.visits)} delta={change(data.totals, data.previous, 'visits')} since={since} />
        <Kpi label="Page views" value={fmt(data.totals.pageviews)} delta={change(data.totals, data.previous, 'pageviews')} since={since} />
        <Kpi label="Bounce rate" value={pct(data.totals.bounceRate)} delta={change(data.totals, data.previous, 'bounceRate')} since={since} upIsBad
          hint="Visits that saw one page and left" />
        <Kpi label="Average visit" value={duration(data.totals.avgVisit)} delta={change(data.totals, data.previous, 'avgVisit')} since={since} />
      </section>

      <section className="insights__card">
        <h2 className="insights__h">Visitors and page views <span className="mono">{RANGES[range].label}</span></h2>
        <TrendChart points={data.series} unit={RANGES[range].unit} timeZone={TIMEZONE} />
      </section>

      <section className="insights__card insights__geo" aria-labelledby="geo-h">
        <h2 id="geo-h" className="insights__h">Where visitors are</h2>
        <WorldMap rows={lists.countries} />
        <List list="countries" rows={lists.countries} range={range} bare />
      </section>

      <div className="insights__grid">
        <List list="cities" rows={lists.cities} range={range} />
        <List list="regions" rows={lists.regions} range={range} />
        <List list="referrers" rows={lists.referrers} range={range} />
        <List list="pages" rows={lists.pages} range={range} />
        <List list="pages" title="Projects viewed" rows={projects} range={range} />
        <List list="events" title="What people do" rows={activity} range={range} />
        <List list="events" title="Contact clicks" rows={contact} range={range} raw />
        <List list="entries" rows={lists.entries} range={range} />
        <List list="devices" rows={lists.devices} range={range} />
        <List list="browsers" rows={lists.browsers} range={range} />
        <List list="os" rows={lists.os} range={range} />
        <List list="screens" rows={lists.screens} range={range} />
        <List list="languages" rows={lists.languages} range={range} />
      </div>

      <footer className="insights__foot mono">
        <ExcludeMe />
        <span>Source: {data.source === 'umami' ? 'Umami, refreshed every minute' : 'sample data'} · times in {TIMEZONE.replace('_', ' ')}</span>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------ pieces */

function SignIn() {
  return (
    <main id="main" className="insights insights--signin">
      <h1 className="display">Insights</h1>
      <p>Private. Sign in with the GitHub account that owns this site.</p>
      <a className="insights__signin" href="/api/auth/github">Sign in with GitHub</a>
    </main>
  );
}

type Delta = { ratio: number | null };
function change(now: Totals, before: Totals, key: keyof Totals): Delta {
  const b = before[key];
  return { ratio: b ? (now[key] - b) / b : null };
}

function Kpi({ label: name, value, delta, since, hero, upIsBad, hint }: {
  label: string; value: string; delta: Delta; since: string; hero?: boolean; upIsBad?: boolean; hint?: string;
}) {
  const r = delta.ratio;
  const flat = r === null || Math.abs(r) < 0.005;
  const good = !flat && (r! > 0) !== Boolean(upIsBad);
  return (
    <div className={`kpi${hero ? ' kpi--hero' : ''}`} title={hint}>
      <p className="kpi__label">{name}</p>
      <p className="kpi__value">{value}</p>
      <p className={`kpi__delta mono${flat ? '' : good ? ' is-good' : ' is-bad'}`}>
        {r === null ? 'No earlier data' : flat ? `No change ${since}` : `${r > 0 ? '↑' : '↓'} ${Math.abs(Math.round(r * 100))}% ${since}`}
      </p>
    </div>
  );
}

function List({ list, rows, range, title, bare, raw }: { list: ListKey; rows: Row[]; range: RangeKey; title?: string; bare?: boolean; raw?: boolean }) {
  const shown = rows.map((r) => ({ label: raw ? r.label : label(list, r.label), value: r.value }));
  const max = Math.max(1, ...shown.map((r) => r.value));
  const total = shown.reduce((s, r) => s + r.value, 0);
  const head = shown.slice(0, 8);
  const rest = shown.slice(8);
  const row = (r: Row) => (
    <li key={r.label} className="blist__row">
      <span className="blist__label">{r.label}</span>
      <span className="blist__value">{r.value.toLocaleString('en')}<small>{total ? pct(r.value / total) : ''}</small></span>
      <i className="blist__bar" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
    </li>
  );
  const Wrap = bare ? 'div' : 'section';
  return (
    <Wrap className={`blist${bare ? ' blist--bare' : ' insights__card'}`}>
      <div className="blist__head">
        {bare ? <span className="mono">Countries</span> : <h2 className="insights__h">{title ?? LISTS[list]}</h2>}
        <span className="mono">{unitOf(list)}</span>
        {!raw && <a className="mono" href={`/api/insights/export?list=${list}&range=${range}`}>CSV</a>}
      </div>
      {shown.length ? (
        <>
          <ol className="blist__rows">{head.map(row)}</ol>
          {rest.length > 0 && (
            <details>
              <summary className="mono">Show all {shown.length}</summary>
              <ol className="blist__rows">{rest.map(row)}</ol>
            </details>
          )}
        </>
      ) : (
        <p className="blist__empty">Nothing yet for this range.</p>
      )}
    </Wrap>
  );
}
