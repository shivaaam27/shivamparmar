import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import {
  Activity, ArrowUpRight, CalendarDays, Compass, Database, Download, FileText, Globe2, Hourglass, Images, LineChart, LogOut, MonitorSmartphone, Radio, Route,
} from 'lucide-react';
import { MIN_SECRET, authConfigured, currentUser, secretStrong } from '@/lib/auth';
import { RANGES, TIMEZONE, toRange, type Insights, type ListKey, type RangeKey, type Row } from '@/lib/umami';
import { defaultSource, getInsights, toSource, type Source } from '@/lib/insights-data';
import { buildGeo } from '@/lib/geo';
import { countryName, duration, label } from '@/lib/insights-format';
import { coverOf, pagedProjects } from '@/lib/work';
import Flip from '@/components/insights/Flip';
import FlatMap from '@/components/insights/FlatMap';
import TrafficChart from '@/components/insights/TrafficChart';
import Skyline from '@/components/insights/Skyline';
import ExcludeMe from '@/components/insights/ExcludeMe';
import AutoRefresh from '@/components/insights/AutoRefresh';
import { Bars, Funnel, Rows, Segments, Spectrum, TickArc, WeekGrid } from '@/components/insights/Charts';
import './insights.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Insights', robots: { index: false, follow: false, nocache: true } };

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-dash' });

type Props = { searchParams: Promise<{ range?: string; source?: string }> };
const fmt = (n: number) => n.toLocaleString('en');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PLURAL = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
const ICON = 15;

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
  const short = (k: RangeKey) => RANGES[k].short.replace(' hours', 'h').replace(' days', 'd').replace(' months', 'm');

  return (
    <main id="main" className={`dash ${inter.variable}`}>
      <AutoRefresh />
      <header className="dash__top">
        <div>
          <p className="dash__eyebrow"><a href="/">shivamparmar.com</a></p>
          <h1 className="dash__title">Insights</h1>
          <p className="dash__sub">{RANGES[range].label}, compared with the {RANGES[range].short} before</p>
        </div>
        <div className="dash__controls">
          <nav className="seg" aria-label="Date range">
            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
              <a key={k} href={link(k, source)} aria-current={k === range ? 'true' : undefined} title={RANGES[k].label}>{short(k)}</a>
            ))}
          </nav>
          <nav className="seg" aria-label="Data source">
            {(['own', 'umami'] as Source[]).map((k) => (
              <a key={k} href={link(range, k)} aria-current={k === source ? 'true' : undefined} title={k === 'own' ? 'Your own database' : 'Umami'}>
                {k === 'own' ? <><Database size={13} aria-hidden="true" />Yours</> : 'Umami'}
              </a>
            ))}
          </nav>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="dash__out" aria-label={`Sign out @${user}`} title={`Signed in as @${user}. Sign out`}><LogOut size={15} aria-hidden="true" /></button>
          </form>
        </div>
      </header>

      {data.note && <p className="dash__note" role="note">{data.note}</p>}

      <div className="grid">
        <When data={data} />
        <Now data={data} />
        <Traffic data={data} />
        <Engagement data={data} />
        <Where data={data} />
        <Sources data={data} csv={csv} />
        <Setup data={data} csv={csv} />
        <Journey data={data} csv={csv} />
        <Pages data={data} csv={csv} />
        <Projects data={data} />
        <Year data={data} />
      </div>

      <footer className="dash__foot">
        <ExcludeMe />
        <span>{data.source === 'own' ? 'Your own database, live' : data.source === 'umami' ? 'Umami, refreshed every minute' : 'Sample data'} · times in {TIMEZONE.replace(/_/g, ' ').replace(/^.*\//, '')}</span>
      </footer>
    </main>
  );
}

/* ================================================================ cards */

/** Row 1, dark: the month's rhythm, three ways. */
function When({ data }: { data: Insights }) {
  const hourly = data.hourly;
  const dayHour = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TIMEZONE });
  const hh = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TIMEZONE });
  const busiest = hourly.reduce((b, p) => (p.visitors > b.visitors ? p : b), hourly[0] ?? { t: 0, visitors: 0, pageviews: 0 });
  const monthTotal = hourly.reduce((a, p) => a + p.visitors, 0);

  let slot = { d: 0, h: 0, v: 0 };
  data.rhythm.forEach((row, d) => row.forEach((v, h) => { if (v > slot.v) slot = { d, h, v }; }));
  const byDay = data.rhythm.map((row) => row.reduce((a, b) => a + b, 0));
  const topDay = byDay.indexOf(Math.max(...byDay));
  const weekTotal = byDay.reduce((a, b) => a + b, 0);

  // the last 7 days in 6-hour blocks
  const last = hourly.slice(-168);
  const blocks: { t: number; value: number }[] = [];
  last.forEach((p, i) => { if (i % 6 === 0) blocks.push({ t: p.t, value: 0 }); blocks[blocks.length - 1].value += p.visitors; });
  const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: TIMEZONE });
  const sevenDays = last.reduce((a, p) => a + p.visitors, 0);
  const bestBlock = blocks.reduce((b, x) => (x.value > b.value ? x : b), blocks[0] ?? { t: 0, value: 0 });

  const at = (t: number) => `${dayHour.format(t)}, ${hh.format(t)}:00`;
  const hr = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <Flip className="card--dark span-8" title="When people visit" icon={<Activity size={ICON} />} views={[
      {
        id: 'hours', label: 'Hour by hour',
        content: (
          <>
            <Facts items={[
              ['Visitors, 4 weeks', fmt(monthTotal)],
              ['Busiest hour', busiest.visitors ? at(busiest.t) : '—'],
              ['At the peak', busiest.visitors ? `${fmt(busiest.visitors)} / hr` : '—'],
            ]} />
            <Spectrum points={hourly} timeZone={TIMEZONE} />
          </>
        ),
      },
      {
        id: 'week', label: 'Week pattern',
        content: (
          <>
            <Facts items={[
              ['Page views, 4 weeks', fmt(weekTotal)],
              ['Busiest day', weekTotal ? PLURAL[topDay] : '—'],
              ['Busiest slot', slot.v ? `${DAYS[slot.d]} ${hr(slot.h)}` : '—'],
            ]} />
            <WeekGrid grid={data.rhythm} />
          </>
        ),
      },
      {
        id: 'seven', label: 'Last 7 days',
        content: (
          <>
            <Facts items={[
              ['Visitors, 7 days', fmt(sevenDays)],
              ['Busiest 6 hours', bestBlock.value ? `${wd.format(bestBlock.t)} ${hh.format(bestBlock.t)}:00` : '—'],
              ['Average a day', fmt(Math.round(sevenDays / 7))],
            ]} />
            <Bars dark unit="visitors" items={blocks.map((b) => {
              const h = Number(hh.format(b.t));
              return { value: b.value, tip: `${wd.format(b.t)} ${hr(h)}–${hr((h + 6) % 24)}`, mark: h < 6 ? wd.format(b.t) : undefined };
            })} />
          </>
        ),
      },
    ]} />
  );
}

/** Row 1, dark: who is here now, and today so far. */
function Now({ data }: { data: Insights }) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });
  const today = day.format(Date.now());
  const todays = data.hourly.filter((p) => day.format(p.t) === today);
  const visitors = todays.reduce((a, p) => a + p.visitors, 0);
  const views = todays.reduce((a, p) => a + p.pageviews, 0);
  return (
    <article className="card card--dark card--glow span-4">
      <header className="card__head">
        <h2 className="card__title"><span className="card__icon" aria-hidden="true"><Radio size={ICON} /></span>Right now</h2>
        <span className={`live${data.live ? ' is-on' : ''}`}><i aria-hidden="true" />Live</span>
      </header>
      <p className="num num--hero">{fmt(data.live)}<small>{data.live === 1 ? 'person on the site' : 'people on the site'}</small></p>
      {data.liveCountries.length > 0 && (
        <ul className="chips">
          {data.liveCountries.slice(0, 4).map((c) => <li key={c.label}><span aria-hidden="true">{flag(c.label)}</span>{countryName(c.label)}<b>{c.value}</b></li>)}
        </ul>
      )}
      <div className="now__today">
        <p><span>Visitors today</span><b>{fmt(visitors)}</b></p>
        <p><span>Page views today</span><b>{fmt(views)}</b></p>
      </div>
    </article>
  );
}

/** Row 2: traffic over the range against the range before. */
function Traffic({ data }: { data: Insights }) {
  return (
    <article className="card span-8">
      <header className="card__head">
        <h2 className="card__title"><span className="card__icon" aria-hidden="true"><LineChart size={ICON} /></span>Traffic</h2>
        <span className="card__meta">{RANGES[data.range].label}</span>
      </header>
      <TrafficChart points={data.series} previous={data.prevSeries} unit={RANGES[data.range].unit} timeZone={TIMEZONE}
        totals={{ visitors: data.totals.visitors, pageviews: data.totals.pageviews }}
        before={{ visitors: data.previous.visitors, pageviews: data.previous.pageviews }} />
    </article>
  );
}

/** Row 2: how long and how deep a visit goes. */
function Engagement({ data }: { data: Insights }) {
  const { totals: t, previous: p } = data;
  const ppv = t.visits ? t.pageviews / t.visits : 0;
  const ppvBefore = p.visits ? p.pageviews / p.visits : 0;
  return (
    <article className="card span-4">
      <header className="card__head">
        <h2 className="card__title"><span className="card__icon" aria-hidden="true"><Hourglass size={ICON} /></span>Average visit</h2>
        <Delta now={t.avgVisit} before={p.avgVisit} />
      </header>
      <p className="num num--hero">{duration(t.avgVisit)}</p>
      <TickArc value={1 - t.bounceRate} caption="of visits went past the first page" />
      <dl className="kv">
        <div><dt>Visits</dt><dd>{fmt(t.visits)}<Delta now={t.visits} before={p.visits} /></dd></div>
        <div><dt>Pages per visit</dt><dd>{ppv.toFixed(1)}<Delta now={ppv} before={ppvBefore} /></dd></div>
      </dl>
    </article>
  );
}

/** Row 3: the map, with every place list beside it. */
function Where({ data }: { data: Insights }) {
  const geo = buildGeo(data.lists.countries, data.lists.regions, data.lists.cities, data.liveCountries);
  return (
    <article className="card card--map span-12" id="map">
      <header className="card__head">
        <h2 className="card__title"><span className="card__icon" aria-hidden="true"><Globe2 size={ICON} /></span>Where they are</h2>
        <span className="card__meta">Scroll or + − to zoom · drag to move · click a country</span>
      </header>
      <FlatMap model={geo} rangeLabel={RANGES[data.range].label} />
    </article>
  );
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex|brave|startpage|qwant|perplexity|chatgpt|openai)\./;
const SOCIAL = /(^|\.)(linkedin|lnkd|t|twitter|x|facebook|fb|instagram|reddit|behance|dribbble|youtube|threads|pinterest|whatsapp|wa|telegram|tiktok|bsky|medium)\./;

/** Row 4: how people found the site. */
function Sources({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const refs = data.lists.referrers;
  const group = { Direct: 0, Search: 0, Social: 0, Websites: 0 };
  refs.forEach((r) => {
    const d = r.label.toLowerCase().replace(/^www\./, '');
    group[!d ? 'Direct' : SEARCH.test(d) ? 'Search' : SOCIAL.test(d) ? 'Social' : 'Websites'] += r.value;
  });
  const parts = Object.entries(group).map(([l, value]) => ({ label: l, value }));
  const sites = refs.filter((r) => r.label).map((r) => ({ label: label('referrers', r.label), value: r.value }));
  return (
    <Flip className="span-4" title="How they found you" icon={<Compass size={ICON} />} views={[
      { id: 'channels', label: 'Channels', content: <><Lead rows={parts} unit="visitors" /><Segments parts={parts} /></> },
      { id: 'sites', label: 'Websites', content: <Rows rows={sites} csv={csv('referrers')} limit={5} /> },
    ]} />
  );
}

/** Row 4: the devices and software people use. */
function Setup({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const { lists } = data;
  const named = (k: ListKey) => lists[k].map((r) => ({ label: label(k, r.label), value: r.value }));
  const devices = named('devices');
  return (
    <Flip className="span-4" title="What they use" icon={<MonitorSmartphone size={ICON} />} views={[
      { id: 'devices', label: 'Devices', content: <><Lead rows={devices} unit="visitors" /><Segments parts={devices.slice(0, 3)} /></> },
      { id: 'browsers', label: 'Browsers', content: <Rows rows={named('browsers')} csv={csv('browsers')} limit={5} /> },
      { id: 'os', label: 'Systems', content: <Rows rows={named('os')} csv={csv('os')} limit={5} /> },
      { id: 'screens', label: 'Screens', content: <Rows rows={named('screens')} csv={csv('screens')} limit={5} /> },
      { id: 'languages', label: 'Languages', content: <Rows rows={named('languages')} csv={csv('languages')} limit={5} /> },
    ]} />
  );
}

/** Row 4: what people do on the site, step by step. */
function Journey({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const ev = data.lists.events;
  const sum = (prefix: string) => ev.filter((r) => r.label.startsWith(prefix)).reduce((s, r) => s + r.value, 0);
  const part = (prefix: string) => ev.filter((r) => r.label.startsWith(prefix)).map((r) => ({ label: r.label.slice(prefix.length), value: r.value }));
  const times = (n: number) => `${fmt(n)} ${n === 1 ? 'time' : 'times'}`;
  const steps = [
    { label: 'Read the About intro', value: sum('Read about') },
    { label: 'Used a work filter', value: sum('Filter · ') },
    { label: 'Opened a project', value: sum('Open project · ') },
    { label: 'Clicked a contact link', value: sum('Contact · ') },
  ].map((s) => ({ ...s, note: times(s.value) }));
  return (
    <Flip className="span-4" title="What they do" icon={<Route size={ICON} />}
      aside={<a className="icon-link" href={csv('events')} aria-label="Download every action as CSV" title="Download CSV"><Download size={14} /></a>}
      views={[
        { id: 'steps', label: 'Journey', content: <><p className="card__hint">As a share of {fmt(data.totals.visitors)} visitors</p><Funnel steps={steps} of={data.totals.visitors} /></> },
        { id: 'filters', label: 'Filters', content: <Rows rows={part('Filter · ')} unit="Times" limit={5} /> },
        { id: 'contact', label: 'Contact', content: <Rows rows={part('Contact · ')} unit="Clicks" limit={5} /> },
      ]} />
  );
}

/** Row 5: the pages people read. */
function Pages({ data, csv }: { data: Insights; csv: (l: ListKey) => string }) {
  const named = (k: ListKey) => data.lists[k].map((r) => ({ label: label(k, r.label), value: r.value }));
  return (
    <Flip className="span-6" title="Pages" icon={<FileText size={ICON} />} views={[
      { id: 'pages', label: 'Most viewed', content: <Rows rows={named('pages')} unit="Views" csv={csv('pages')} limit={7} /> },
      { id: 'entries', label: 'First page of a visit', content: <Rows rows={named('entries')} unit="Visits" csv={csv('entries')} limit={7} /> },
    ]} />
  );
}

/** Row 5: each project as a photo, flipped through with the arrows. */
function Projects({ data }: { data: Insights }) {
  const views = new Map(data.lists.pages.map((r) => [r.label, r.value]));
  const prefix = 'Open project · ';
  const opens = new Map(data.lists.events.filter((r) => r.label.startsWith(prefix)).map((r) => [r.label.slice(prefix.length), r.value]));
  const all = pagedProjects().map(({ project, sub }) => ({ project, sub, views: views.get(`/work/${project.slug}`) ?? 0, opens: opens.get(project.title) ?? 0 }))
    .sort((a, b) => b.views - a.views);
  const totalViews = data.totals.pageviews;
  return (
    <Flip className="span-6 card--shots" title="Projects" icon={<Images size={ICON} />} views={all.map(({ project, sub, views: v, opens: o }, i) => ({
      id: project.slug, label: project.title,
      content: (
        <a className="shot" href={`/work/${project.slug}`} style={{ backgroundImage: `url(${coverOf(project)})` }}>
          <span className="shot__rank">#{i + 1} of {all.length}</span>
          <span className="shot__foot">
            <span className="shot__name"><small>{sub.name}</small>{project.title}</span>
            <span className="shot__nums">
              <b>{fmt(v)}<small>views</small></b>
              <b>{fmt(o)}<small>opened from Work</small></b>
              <b>{totalViews ? `${((v / totalViews) * 100).toFixed(1)}%` : '—'}<small>of all views</small></b>
            </span>
          </span>
        </a>
      ),
    }))} />
  );
}

/** Row 6: the last 12 months, day by day. */
function Year({ data }: { data: Insights }) {
  return (
    <Flip className="span-12" title="The year" icon={<CalendarDays size={ICON} />} views={[
      { id: 'calendar', label: 'Calendar', content: <Skyline days={data.year} timeZone={TIMEZONE} view="calendar" /> },
      { id: 'skyline', label: 'Skyline', content: <Skyline days={data.year} timeZone={TIMEZONE} view="skyline" /> },
    ]} />
  );
}

/* ================================================================ pieces */

function SignIn() {
  return (
    <main id="main" className={`dash dash--signin ${inter.variable}`}>
      <div className="card signin">
        <p className="dash__eyebrow">Private</p>
        <h1 className="dash__title">Insights</h1>
        {secretStrong() ? (
          <>
            <p className="signin__text">Sign in with the GitHub account that owns this site.</p>
            <a className="signin__btn" href="/api/auth/github">Sign in with GitHub<ArrowUpRight size={16} aria-hidden="true" /></a>
          </>
        ) : (
          <p className="dash__note" role="alert">
            Sign-in is paused: AUTH_SECRET in Vercel is too short to keep this page private. Set it to a random value of at
            least {MIN_SECRET} characters and redeploy.
          </p>
        )}
      </div>
    </main>
  );
}

/** "↑ 12%" against the range before, green when it went the good way. */
function Delta({ now, before, upIsBad }: { now: number; before: number; upIsBad?: boolean }) {
  if (!before) return null;
  const r = (now - before) / before;
  if (Math.abs(r) < 0.005) return <span className="delta">Same</span>;
  const good = (r > 0) !== Boolean(upIsBad);
  return (
    <span className={`delta ${good ? 'is-good' : 'is-bad'}`} title="Against the period before">
      {r > 0 ? '↑' : '↓'} {Math.abs(Math.round(r * 100))}%
    </span>
  );
}

/** A few labelled numbers in a row. */
function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="facts">
      {items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

/** The largest part as a headline: "62% direct". */
function Lead({ rows, unit }: { rows: Row[]; unit: string }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const top = rows.reduce((b, r) => (r.value > b.value ? r : b), rows[0] ?? { label: '', value: 0 });
  if (!total) return null;
  return <p className="num">{Math.round((top.value / total) * 100)}<small>% {top.label.toLowerCase()} · of {fmt(total)} {unit}</small></p>;
}

/** Flag emoji from a country code (shows the letters where flags aren't drawn). */
function flag(code: string) {
  return /^[A-Za-z]{2}$/.test(code) ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : '';
}
