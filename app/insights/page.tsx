import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, Database, Download, LogOut } from 'lucide-react';
import { MIN_SECRET, authConfigured, currentUser, secretStrong } from '@/lib/auth';
import { RANGES, TIMEZONE, toRange, type Insights, type ListKey, type RangeKey, type Row } from '@/lib/umami';
import { defaultSource, getInsights, toSource, type Source } from '@/lib/insights-data';
import { buildGeo } from '@/lib/geo';
import { duration, label, pct } from '@/lib/insights-format';
import { compact } from '@/lib/chart';
import { coverOf, pagedProjects } from '@/lib/work';
import Deck, { type Slide } from '@/components/insights/Deck';
import FlatMap from '@/components/insights/FlatMap';
import TrafficChart from '@/components/insights/TrafficChart';
import Skyline from '@/components/insights/Skyline';
import Rhythm from '@/components/insights/Rhythm';
import ExcludeMe from '@/components/insights/ExcludeMe';
import { NeedleBars, PillBars, Progress, Segments, Spectrum, TickRing } from '@/components/insights/Charts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Insights', robots: { index: false, follow: false, nocache: true } };

type Props = { searchParams: Promise<{ range?: string; source?: string }> };
const fmt = (n: number) => n.toLocaleString('en');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PLURAL = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];

export default async function InsightsPage({ searchParams }: Props) {
  if (!authConfigured()) notFound();
  const user = await currentUser();
  if (!user) return <SignIn />;

  const params = await searchParams;
  const range = toRange(params.range);
  const source: Source = toSource(params.source) ?? defaultSource();
  const data = await getInsights(range, source);
  const link = (r: RangeKey, s: Source) => `/insights?range=${r}${s === defaultSource() ? '' : `&source=${s}`}`;
  const csv = (list: ListKey) => `/api/insights/export?list=${list}&range=${range}&source=${source}`;

  const slides: Slide[] = [
    { id: 'overview', title: 'Overview', content: <Overview data={data} /> },
    { id: 'audience', title: 'Audience', content: <Audience data={data} csv={csv} /> },
    { id: 'content', title: 'Content', content: <Content data={data} csv={csv} /> },
    { id: 'map', title: 'Map', content: <MapSlide data={data} /> },
    { id: 'trends', title: 'Trends', content: <Trends data={data} /> },
    { id: 'year', title: 'Year', content: <Year data={data} /> },
  ];

  return (
    <main id="main" className="ins">
      <header className="ins__bar">
        <div className="ins__brand">
          <a className="wordmark" href="/">Shivam</a>
          <span className="ins__crumb">Insights</span>
        </div>
        <div className="ins__controls">
          <nav className="seg" aria-label="Date range">
            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
              <a key={k} href={link(k, source)} aria-current={k === range ? 'true' : undefined}>{RANGES[k].short.replace(' hours', 'h').replace(' days', 'd').replace(' months', 'm')}</a>
            ))}
          </nav>
          <nav className="seg" aria-label="Data source">
            {(['own', 'umami'] as Source[]).map((k) => (
              <a key={k} href={link(range, k)} aria-current={k === source ? 'true' : undefined} title={k === 'own' ? 'Your own database' : 'Umami'}>
                {k === 'own' ? <><Database size={13} aria-hidden="true" />Yours</> : 'Umami'}
              </a>
            ))}
          </nav>
          <span className="ins__live"><i aria-hidden="true" />{data.live} live</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="ins__out" aria-label={`Sign out @${user}`} title={`Signed in as @${user}`}><LogOut size={15} aria-hidden="true" /></button>
          </form>
        </div>
      </header>

      {data.note && <p className="ins__note" role="note">{data.note}</p>}

      <Deck slides={slides} />

      <footer className="ins__foot mono">
        <ExcludeMe />
        <span>{data.source === 'own' ? 'Your own database, live' : data.source === 'umami' ? 'Umami, refreshed every minute' : 'Sample data'} · {RANGES[range].label} · times in {TIMEZONE.replace(/_/g, ' ')}</span>
      </footer>
    </main>
  );
}

/* ================================================================ slides */

function Head({ n, eyebrow, title, sub }: { n: number; eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="slide__head">
      <p className="tiny">{String(n).padStart(2, '0')} · {eyebrow}</p>
      <h2 className="slide__title">{title}</h2>
      {sub && <p className="slide__sub">{sub}</p>}
    </header>
  );
}

function Overview({ data }: { data: Insights }) {
  const { totals, previous, range } = data;
  const since = `vs previous ${RANGES[range].short}`;
  const unit = RANGES[range].unit;
  const tick = new Intl.DateTimeFormat('en-GB', unit === 'hour' ? { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE } : unit === 'month' ? { month: 'short', timeZone: TIMEZONE } : { day: 'numeric', month: 'short', timeZone: TIMEZONE });
  const s = data.series;
  const mid = s[Math.floor(s.length / 2)];
  const weekday = byWeekday(data);
  const busiest = data.hourly.reduce((b, p) => (p.visitors > b.visitors ? p : b), data.hourly[0] ?? { t: 0, visitors: 0, pageviews: 0 });
  const peakDay = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: TIMEZONE });
  const peakHour = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TIMEZONE });
  const peakFmt = { format: (t: number) => `${peakDay.format(t)} ${peakHour.format(t)}:00` };

  return (
    <div className="slide">
      <Head n={1} eyebrow="Overview" title="At a glance" sub={RANGES[range].label} />
      <div className="bento">
        <article className="card card--blue span-7 rows-2">
          <p className="tiny">Visitors</p>
          <p className="big big--xl">{fmt(totals.visitors)}</p>
          <Delta now={totals.visitors} before={previous.visitors} since={since} onDark />
          <div className="card__foot">
            <NeedleBars values={s.map((p) => p.visitors)}
              labels={[s[0] ? tick.format(s[0].t) : '', mid ? tick.format(mid.t) : '', s.at(-1) ? tick.format(s.at(-1)!.t) : '']}
              tips={s.map((p) => `${fmt(p.visitors)} visitors · ${tick.format(p.t)}`)} />
          </div>
        </article>

        <article className="card span-5">
          <div className="card__row">
            <div>
              <p className="tiny">Page views</p>
              <p className="big">{compact(totals.pageviews)}</p>
              <Delta now={totals.pageviews} before={previous.pageviews} since={since} />
            </div>
            <p className="tiny card__aside">{weekday.caption}</p>
          </div>
          <PillBars items={weekday.items} unit="page views" />
        </article>

        <article className="card card--sky span-3">
          <p className="tiny">Average visit</p>
          <p className="big big--lg">{duration(totals.avgVisit)}</p>
          <Delta now={totals.avgVisit} before={previous.avgVisit} since={since} />
          <p className="card__note">{(totals.visits ? totals.pageviews / totals.visits : 0).toFixed(1)} pages per visit</p>
        </article>

        <article className="card span-2 card--center">
          <p className="tiny">Stayed on</p>
          <TickRing value={1 - totals.bounceRate} label="of visits saw more than one page" size={150} />
          <p className="card__note">saw more than one page</p>
        </article>

        <article className="card card--ink span-12">
          <div className="card__row">
            <div>
              <p className="tiny">Hour by hour · last 4 weeks</p>
              <p className="big big--md">{busiest.visitors ? peakFmt.format(busiest.t) : '—'}<small> busiest hour</small></p>
            </div>
            <p className="tiny card__aside">{fmt(data.hourly.reduce((a, p) => a + p.visitors, 0))} visitor-hours</p>
          </div>
          <Spectrum points={data.hourly} timeZone={TIMEZONE} />
        </article>
      </div>
    </div>
  );
}

/** Page views grouped so the capsules read naturally for the range. */
function byWeekday(data: Insights) {
  const unit = RANGES[data.range].unit;
  const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: TIMEZONE });
  if (unit === 'day') {
    const sums = new Map(DAYS.map((d) => [d, 0]));
    data.series.forEach((p) => { const d = wd.format(p.t); sums.set(d, (sums.get(d) ?? 0) + p.pageviews); });
    return { caption: 'By day of the week', items: DAYS.map((d) => ({ label: d, value: sums.get(d) ?? 0 })) };
  }
  if (unit === 'hour') {
    const hr = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TIMEZONE });
    const blocks = [0, 4, 8, 12, 16, 20].map((h) => ({ label: `${String(h).padStart(2, '0')}h`, value: 0 }));
    data.series.forEach((p) => { blocks[Math.floor(Number(hr.format(p.t)) / 4)].value += p.pageviews; });
    return { caption: 'By time of day', items: blocks };
  }
  const mo = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: TIMEZONE });
  return { caption: 'Last 7 months', items: data.series.slice(-7).map((p) => ({ label: mo.format(p.t), value: p.pageviews })) };
}

function Audience({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const { lists } = data;
  const countries = lists.countries.filter((r) => r.label);
  const devices = lists.devices.map((r) => ({ label: label('devices', r.label), value: r.value }));
  const devTotal = devices.reduce((s, r) => s + r.value, 0);
  const topDevice = devices[0];
  const refs = lists.referrers.map((r) => ({ label: label('referrers', r.label), value: r.value }));
  const topRef = refs.find((r) => r.label !== 'Direct or unknown') ?? refs[0];
  return (
    <div className="slide">
      <Head n={2} eyebrow="Audience" title="Who they are" sub={RANGES[data.range].label} />
      <div className="bento">
        <article className="card span-5 rows-2">
          <div className="card__row">
            <div>
              <p className="tiny">Countries</p>
              <p className="big">{countries.length}<small> reached</small></p>
            </div>
            <a className="pill-link mono" href="#map">Open map<ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
          <List list="countries" rows={lists.countries} csv={csv('countries')} limit={8} />
        </article>

        <article className="card span-4 rows-2">
          <p className="tiny">Where they come from</p>
          <p className="big big--md">{topRef ? topRef.label : '—'}</p>
          <p className="card__note">{topRef ? `${fmt(topRef.value)} visitors, the most of any source` : 'No visits yet'}</p>
          <List list="referrers" rows={lists.referrers} csv={csv('referrers')} limit={7} />
        </article>

        <article className="card card--ink span-3">
          <p className="tiny">Devices</p>
          <p className="big big--md">{topDevice && devTotal ? `${Math.round((topDevice.value / devTotal) * 100)}%` : '—'}<small> {topDevice ? `on ${topDevice.label.toLowerCase()}` : ''}</small></p>
          <Segments parts={devices.slice(0, 3)} />
        </article>

        <article className="card span-3">
          <p className="tiny">Browsers</p>
          <Mini rows={lists.browsers.slice(0, 5).map((r) => ({ label: label('browsers', r.label), value: r.value }))} />
        </article>

        <article className="card span-4">
          <p className="tiny">Languages</p>
          <Mini rows={lists.languages.slice(0, 5).map((r) => ({ label: label('languages', r.label), value: r.value }))} />
        </article>
        <article className="card span-4">
          <p className="tiny">Systems</p>
          <Mini rows={lists.os.slice(0, 5)} />
        </article>
        <article className="card span-4">
          <p className="tiny">Screen sizes</p>
          <Mini rows={lists.screens.slice(0, 5).map((r) => ({ label: label('screens', r.label), value: r.value }))} />
        </article>
      </div>
    </div>
  );
}

function Content({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const { lists, totals } = data;
  const views = new Map(lists.pages.map((r) => [r.label, r.value]));
  const projects = pagedProjects().map(({ project, sub }) => ({ project, sub, views: views.get(`/work/${project.slug}`) ?? 0 }))
    .sort((a, b) => b.views - a.views).slice(0, 3);
  const count = (prefix: string) => lists.events.filter((r) => r.label.startsWith(prefix)).reduce((s, r) => s + r.value, 0);
  const per100 = (v: number) => (totals.visitors ? Math.min(100, Math.round((v / totals.visitors) * 100)) : 0);
  const contacts = lists.events.filter((r) => r.label.startsWith('Contact · ')).map((r) => ({ label: r.label.replace('Contact · ', ''), value: r.value }));
  const contactTotal = contacts.reduce((s, r) => s + r.value, 0);
  const actions = lists.events.filter((r) => !r.label.startsWith('Contact · '));

  return (
    <div className="slide">
      <Head n={3} eyebrow="Content" title="What they look at" sub={RANGES[data.range].label} />
      <div className="bento">
        {projects.map(({ project, sub, views: v }) => (
          <a key={project.slug} className={`card card--photo span-${projects.length === 1 ? 12 : projects.length === 2 ? 6 : 4}`} href={`/work/${project.slug}`}
            style={{ backgroundImage: `url(${coverOf(project)})` }}>
            <p className="tiny">{sub.name}</p>
            <div className="card__photo-foot">
              <p className="card__photo-title">{project.title}</p>
              <p className="big big--lg">{fmt(v)}<small> views</small></p>
            </div>
          </a>
        ))}

        <article className="card span-5">
          <p className="tiny">Journey · per 100 visitors</p>
          <div className="progs">
            <Progress label="Read the About intro" value={per100(count('Read about'))} of={100} />
            <Progress label="Used a work filter" value={per100(count('Filter · '))} of={100} />
            <Progress label="Opened a project" value={per100(count('Open project · '))} of={100} />
            <Progress label="Clicked a contact link" value={per100(contactTotal)} of={100} />
          </div>
        </article>

        <article className="card span-4">
          <p className="tiny">Pages</p>
          <List list="pages" rows={lists.pages} csv={csv('pages')} limit={6} unit="Views" />
        </article>

        <article className="card card--ink span-3">
          <p className="tiny">Contact clicks</p>
          <p className="big big--lg">{fmt(contactTotal)}</p>
          <Mini rows={contacts} onDark empty="No contact clicks yet." />
        </article>

        <article className="card span-6">
          <p className="tiny">What people do</p>
          <List list="events" rows={actions} csv={csv('events')} limit={6} unit="Times" raw />
        </article>
        <article className="card span-6">
          <p className="tiny">First page of a visit</p>
          <List list="entries" rows={lists.entries} csv={csv('entries')} limit={6} unit="Visits" />
        </article>
      </div>
    </div>
  );
}

function MapSlide({ data }: { data: Insights }) {
  const geo = buildGeo(data.lists.countries, data.lists.regions, data.lists.cities, data.liveCountries);
  return (
    <div className="slide">
      <Head n={4} eyebrow="Map" title="Where they are" sub="Scroll or use + and − to zoom, drag to move, click a country to look inside." />
      <div className="bento">
        <article className="card card--map span-12"><FlatMap model={geo} rangeLabel={RANGES[data.range].label} /></article>
      </div>
    </div>
  );
}

function Trends({ data }: { data: Insights }) {
  const { totals, range } = data;
  const byDay = data.rhythm.map((row, d) => ({ label: DAYS[d], value: row.reduce((a, b) => a + b, 0) }));
  return (
    <div className="slide">
      <Head n={5} eyebrow="Trends" title="How it moves" sub={RANGES[range].label} />
      <div className="bento">
        <article className="card span-8">
          <p className="tiny">Traffic, with the previous period dashed</p>
          <TrafficChart points={data.series} previous={data.prevSeries} unit={RANGES[range].unit} timeZone={TIMEZONE}
            totals={{ visitors: totals.visitors, pageviews: totals.pageviews }} />
        </article>
        <article className="card card--sky span-4">
          <p className="tiny">Busiest days · last 4 weeks</p>
          <p className="big big--md">{byDay.some((d) => d.value) ? PLURAL[byDay.indexOf(byDay.reduce((b, d) => (d.value > b.value ? d : b)))] : '—'}</p>
          <PillBars items={byDay} unit="page views" />
        </article>
        <article className="card span-12">
          <p className="tiny">When they visit · weekday and hour, last 4 weeks</p>
          <Rhythm grid={data.rhythm} />
        </article>
      </div>
    </div>
  );
}

function Year({ data }: { data: Insights }) {
  return (
    <div className="slide">
      <Head n={6} eyebrow="Year" title="The year in visits" sub="Last 12 months, day by day" />
      <div className="bento">
        <article className="card span-12"><Skyline days={data.year} timeZone={TIMEZONE} /></article>
      </div>
    </div>
  );
}

/* ================================================================ pieces */

function SignIn() {
  return (
    <main id="main" className="ins ins--signin">
      <p className="tiny">Private</p>
      <h1 className="ins__h1">Insights</h1>
      {secretStrong() ? (
        <>
          <p>Sign in with the GitHub account that owns this site.</p>
          <a className="ins__signin" href="/api/auth/github">Sign in with GitHub<ArrowUpRight size={16} aria-hidden="true" /></a>
        </>
      ) : (
        <p className="ins__note" role="alert">
          Sign-in is paused: AUTH_SECRET in Vercel is too short to keep this page private. Set it to a random value of at
          least {MIN_SECRET} characters and redeploy.
        </p>
      )}
    </main>
  );
}

function Delta({ now, before, since, upIsBad, onDark }: { now: number; before: number; since?: string; upIsBad?: boolean; onDark?: boolean }) {
  const r = before ? (now - before) / before : null;
  if (r === null) return <p className={`delta${onDark ? ' on-dark' : ''}`}>No earlier data to compare</p>;
  const flat = Math.abs(r) < 0.005;
  const good = (r > 0) !== Boolean(upIsBad);
  const Icon = r > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`delta${onDark ? ' on-dark' : ''}`}>
      <b className={flat ? '' : good ? 'is-good' : 'is-bad'}>{flat ? 'Same' : <><Icon size={13} aria-hidden="true" />{Math.abs(Math.round(r * 100))}%</>}</b>
      {since && <span>{since}</span>}
    </p>
  );
}

function List({ list, rows, csv, limit, unit, raw }: { list: ListKey; rows: Row[]; csv?: string; limit: number; unit?: string; raw?: boolean }) {
  const shown = rows.map((r) => ({ label: raw ? r.label : label(list, r.label), value: r.value }));
  const max = Math.max(1, ...shown.map((r) => r.value));
  const total = shown.reduce((s, r) => s + r.value, 0);
  const row = (r: Row) => (
    <li key={r.label}>
      <span className="list__label">{r.label}</span>
      <span className="list__val">{fmt(r.value)}<small>{total ? pct(r.value / total) : ''}</small></span>
      <i style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
    </li>
  );
  return (
    <div className="list">
      <p className="list__head mono"><span>{unit ?? 'Visitors'}</span>{csv && <a href={csv} aria-label="Download as CSV" title="Download CSV"><Download size={13} /></a>}</p>
      {shown.length ? (
        <>
          <ol>{shown.slice(0, limit).map(row)}</ol>
          {shown.length > limit && <details><summary className="mono">Show all {shown.length}</summary><ol>{shown.slice(limit).map(row)}</ol></details>}
        </>
      ) : <p className="empty">Nothing yet for this range.</p>}
    </div>
  );
}

function Mini({ rows, onDark, empty }: { rows: Row[]; onDark?: boolean; empty?: string }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!rows.length) return <p className="empty">{empty ?? 'Nothing yet.'}</p>;
  return (
    <ul className={`mini${onDark ? ' on-dark' : ''}`}>
      {rows.map((r) => <li key={r.label}><span>{r.label || 'Unknown'}</span><b>{total ? pct(r.value / total) : ''}</b></li>)}
    </ul>
  );
}

