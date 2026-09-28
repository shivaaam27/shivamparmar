import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, Clock, Compass, Download, FileText, FolderOpen,
  Languages, Link2, LogOut, Mail, Maximize2, MousePointerClick, Route, Smartphone, Timer, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MIN_SECRET, authConfigured, currentUser, secretStrong } from '@/lib/auth';
import { RANGES, TIMEZONE, getInsights, toRange, type ListKey, type RangeKey, type Row, type Totals } from '@/lib/umami';
import { buildGeo } from '@/lib/geo';
import { duration, label, pct } from '@/lib/insights-format';
import { compact } from '@/lib/chart';
import TrafficChart from '@/components/insights/TrafficChart';
import GeoExplorer from '@/components/insights/GeoExplorer';
import Skyline from '@/components/insights/Skyline';
import Rhythm from '@/components/insights/Rhythm';
import Sparkline from '@/components/insights/Sparkline';
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
  const { lists, totals, previous } = data;
  const since = `vs previous ${RANGES[range].short}`;
  const built = buildGeo(lists.countries, lists.regions, lists.cities);
  // detailed outlines load when a country is opened, to keep this page light
  const geo = { ...built, countries: built.countries.map((c) => ({ ...c, land: [], bars: [] })) };

  const pagesPerVisit = (t: Totals) => (t.visits ? t.pageviews / t.visits : 0);
  const projects = lists.pages.filter((r) => r.label.startsWith('/work/'));
  const contact = lists.events.filter((r) => r.label.startsWith('Contact · ')).map((r) => ({ ...r, label: r.label.replace('Contact · ', '') }));
  const actions = lists.events.filter((r) => !r.label.startsWith('Contact · '));
  const count = (prefix: string) => lists.events.filter((r) => r.label.startsWith(prefix)).reduce((s, r) => s + r.value, 0);

  return (
    <main id="main" className="ins">
      {/* ---------------------------------------------------------------- top */}
      <header className="ins__bar">
        <a className="wordmark" href="/">Shivam</a>
        <div className="ins__who mono">
          <span className="ins__live"><i aria-hidden="true" />{data.live} on the site now</span>
          <span className="ins__user">@{user}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" aria-label="Sign out"><LogOut size={15} aria-hidden="true" /><span>Sign out</span></button>
          </form>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section className="ins__hero">
        <div className="ins__title">
          <p className="ins__eyebrow mono">Private · {RANGES[range].label}</p>
          <h1 className="ins__h1">Insights</h1>
        </div>
        <nav className="ins__ranges" aria-label="Date range">
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <a key={k} href={`/insights?range=${k}`} aria-current={k === range ? 'true' : undefined}>{RANGES[k].short}</a>
          ))}
        </nav>

        {data.note && <p className="ins__note" role="note">{data.note}</p>}

        <div className="ins__kpis">
          <div className="kpi kpi--hero">
            <p className="kpi__label"><Users size={16} aria-hidden="true" />Visitors</p>
            <p className="kpi__value">{totals.visitors.toLocaleString('en')}</p>
            <Delta now={totals.visitors} before={previous.visitors} since={since} />
            <Sparkline values={data.series.map((p) => p.visitors)} height={70} />
          </div>
          <Kpi icon={Route} label="Visits" value={compact(totals.visits)} now={totals.visits} before={previous.visits} since={since} />
          <Kpi icon={FileText} label="Page views" value={compact(totals.pageviews)} now={totals.pageviews} before={previous.pageviews} since={since}
            spark={data.series.map((p) => p.pageviews)} sparkColor="var(--viz-2)" />
          <Kpi icon={Timer} label="Average visit" value={duration(totals.avgVisit)} now={totals.avgVisit} before={previous.avgVisit} since={since} />
          <Kpi icon={MousePointerClick} label="Bounce rate" value={pct(totals.bounceRate)} now={totals.bounceRate} before={previous.bounceRate} since={since} upIsBad
            hint="Visits that saw one page and left" />
        </div>
      </section>

      {/* ------------------------------------------------------------ the map */}
      <section className="ins__geo" aria-labelledby="geo-h">
        <div className="ins__geo-head">
          <p className="ins__eyebrow mono">Where they are · {RANGES[range].label}</p>
          <h2 id="geo-h" className="ins__h2">Around the world</h2>
          <p className="ins__geo-sub">Each column is as tall as its visitors. Pick a country to see its regions and cities.</p>
        </div>
        <GeoExplorer model={geo} range={range} rangeLabel={RANGES[range].label} />
      </section>

      {/* -------------------------------------------------------------- cards */}
      <section className="ins__cards" aria-label="Details">
        <Card icon={Users} title="Traffic" wide>
          <TrafficChart points={data.series} previous={data.prevSeries} unit={RANGES[range].unit} timeZone={TIMEZONE}
            totals={{ visitors: totals.visitors, pageviews: totals.pageviews }} />
        </Card>

        <Card icon={Timer} title="Engagement">
          <div className="figs">
            <Fig label="Average visit" value={duration(totals.avgVisit)} now={totals.avgVisit} before={previous.avgVisit} />
            <Fig label="Pages per visit" value={pagesPerVisit(totals).toFixed(1)} now={pagesPerVisit(totals)} before={pagesPerVisit(previous)} />
            <Fig label="Bounce rate" value={pct(totals.bounceRate)} now={totals.bounceRate} before={previous.bounceRate} upIsBad />
          </div>
          <Meter label="Stayed for more than one page" value={1 - totals.bounceRate} />
          <div className="engage__trend">
            <p><span>Pages per visitor, over the period</span><b>{(totals.visitors ? totals.pageviews / totals.visitors : 0).toFixed(1)}</b></p>
            <Sparkline values={data.series.map((p) => (p.visitors ? p.pageviews / p.visitors : 0))} color="var(--viz-2)" height={64} />
          </div>
        </Card>

        <Card icon={Compass} title="Where they come from" csv="referrers" range={range}>
          <BarList list="referrers" rows={lists.referrers} icon={Link2} />
        </Card>

        <Card icon={Smartphone} title="Devices" csv="devices" range={range}>
          <Split rows={lists.devices.map((r) => ({ label: label('devices', r.label), value: r.value }))} />
          <div className="minirows">
            <MiniRows title="Browsers" rows={lists.browsers.slice(0, 4).map((r) => ({ label: label('browsers', r.label), value: r.value }))} />
            <MiniRows title="Systems" rows={lists.os.slice(0, 4)} />
          </div>
        </Card>

        <Card icon={Route} title="Journey" note="Actions per 100 visitors">
          <Journey visitors={totals.visitors} steps={[
            { label: 'Read the About intro', value: count('Read about') },
            { label: 'Used a work filter', value: count('Filter · ') },
            { label: 'Opened a project', value: count('Open project · ') },
            { label: 'Clicked a contact link', value: count('Contact · ') },
          ]} />
        </Card>

        <Card icon={FileText} title="Pages" csv="pages" range={range}>
          <BarList list="pages" rows={lists.pages} unit="views" />
        </Card>

        <Card icon={FolderOpen} title="Projects viewed">
          <BarList list="pages" rows={projects} unit="views" empty="No project pages opened yet." />
        </Card>

        <Card icon={MousePointerClick} title="What people do" csv="events" range={range}>
          <BarList list="events" rows={actions} unit="times" raw />
        </Card>

        <Card icon={Clock} title="When they visit" note="Last 4 weeks" wide>
          <Rhythm grid={data.rhythm} />
        </Card>

        <Card icon={Mail} title="Contact clicks">
          <BarList list="events" rows={contact} unit="times" raw empty="No contact clicks yet." />
          <div className="minirows minirows--single">
            <MiniRows title="Entry pages" rows={lists.entries.slice(0, 4).map((r) => ({ label: label('entries', r.label), value: r.value }))} />
          </div>
        </Card>

        <Card icon={Languages} title="Languages" csv="languages" range={range}>
          <BarList list="languages" rows={lists.languages} />
        </Card>

        <Card icon={Maximize2} title="Screen sizes" csv="screens" range={range}>
          <BarList list="screens" rows={lists.screens} />
        </Card>

        <Card icon={BookOpen} title="Regions" csv="regions" range={range}>
          <BarList list="regions" rows={lists.regions} />
        </Card>

        <Card icon={CalendarDays} title="The year in visits" note="Last 12 months" full>
          <Skyline days={data.year} timeZone={TIMEZONE} />
        </Card>
      </section>

      <footer className="ins__foot mono">
        <ExcludeMe />
        <span>{data.source === 'umami' ? 'Live from Umami, refreshed every minute' : 'Sample data'} · times in {TIMEZONE.replace(/_/g, ' ')}</span>
      </footer>
    </main>
  );
}

/* ================================================================ pieces */

function SignIn() {
  return (
    <main id="main" className="ins ins--signin">
      <p className="ins__eyebrow mono">Private</p>
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

function ratio(now: number, before: number) { return before ? (now - before) / before : null; }

function Delta({ now, before, since, upIsBad }: { now: number; before: number; since?: string; upIsBad?: boolean }) {
  const r = ratio(now, before);
  if (r === null) return <p className="delta mono">No earlier data</p>;
  const flat = Math.abs(r) < 0.005;
  const good = (r > 0) !== Boolean(upIsBad);
  const Icon = r > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`delta mono${flat ? '' : good ? ' is-good' : ' is-bad'}`}>
      {flat ? <span>No change</span> : <b><Icon size={13} aria-hidden="true" />{Math.abs(Math.round(r * 100))}%</b>}
      {since && <span>{since}</span>}
    </p>
  );
}

function Kpi({ icon: Icon, label: name, value, now, before, since, upIsBad, hint, spark, sparkColor }: {
  icon: LucideIcon; label: string; value: string; now: number; before: number; since: string;
  upIsBad?: boolean; hint?: string; spark?: number[]; sparkColor?: string;
}) {
  return (
    <div className="kpi" title={hint}>
      <p className="kpi__label"><Icon size={15} aria-hidden="true" />{name}</p>
      <p className="kpi__value">{value}</p>
      <Delta now={now} before={before} since={since} upIsBad={upIsBad} />
      {spark && <Sparkline values={spark} color={sparkColor} height={34} />}
    </div>
  );
}

function Card({ icon: Icon, title, children, csv, range, note, wide, full }: {
  icon: LucideIcon; title: string; children: React.ReactNode; csv?: ListKey; range?: RangeKey; note?: string; wide?: boolean; full?: boolean;
}) {
  return (
    <section className={`card${wide ? ' card--wide' : ''}${full ? ' card--full' : ''}`}>
      <header className="card__head">
        <h2><span className="card__icon"><Icon size={16} aria-hidden="true" /></span>{title}</h2>
        {note && <span className="card__note mono">{note}</span>}
        {csv && range && (
          <a className="card__csv" href={`/api/insights/export?list=${csv}&range=${range}`} aria-label={`Download ${title} as CSV`} title="Download CSV">
            <Download size={15} aria-hidden="true" />
          </a>
        )}
      </header>
      {children}
    </section>
  );
}

function Fig({ label: name, value, now, before, upIsBad }: { label: string; value: string; now: number; before: number; upIsBad?: boolean }) {
  return (
    <div className="fig">
      <p className="fig__value">{value}</p>
      <p className="fig__label">{name}</p>
      <Delta now={now} before={before} upIsBad={upIsBad} />
    </div>
  );
}

function Meter({ label: name, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <p className="meter__label"><span>{name}</span><b>{pct(value)}</b></p>
      <div className="meter__track"><i style={{ width: pct(value) }} /></div>
    </div>
  );
}

function BarList({ list, rows, unit, raw, empty, icon: Icon }: { list: ListKey; rows: Row[]; unit?: string; raw?: boolean; empty?: string; icon?: LucideIcon }) {
  const shown = rows.map((r) => ({ label: raw ? r.label : label(list, r.label), value: r.value }));
  if (!shown.length) return <p className="blist__empty">{empty ?? 'Nothing yet for this range.'}</p>;
  const max = Math.max(1, ...shown.map((r) => r.value));
  const total = shown.reduce((s, r) => s + r.value, 0);
  const row = (r: Row) => (
    <li key={r.label} className="blist__row">
      <i className="blist__bar" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
      <span className="blist__label">{Icon && <Icon size={13} aria-hidden="true" />}{r.label}</span>
      <span className="blist__value">{r.value.toLocaleString('en')}<small>{pct(r.value / total)}</small></span>
    </li>
  );
  return (
    <div className="blist">
      {unit && <p className="blist__unit mono">{unit}</p>}
      <ol className="blist__rows">{shown.slice(0, 7).map(row)}</ol>
      {shown.length > 7 && (
        <details><summary className="mono">Show all {shown.length}</summary><ol className="blist__rows">{shown.slice(7).map(row)}</ol></details>
      )}
    </div>
  );
}

const SPLIT = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--taupe-lite)'];
function Split({ rows }: { rows: Row[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!total) return <p className="blist__empty">No devices yet.</p>;
  const main = rows.slice(0, 3);
  const other = rows.slice(3).reduce((s, r) => s + r.value, 0);
  const parts = other ? [...main, { label: 'Other', value: other }] : main;
  return (
    <div className="split">
      <div className="split__bar" role="img" aria-label={parts.map((p) => `${p.label} ${pct(p.value / total)}`).join(', ')}>
        {parts.map((p, i) => <i key={p.label} style={{ flexGrow: p.value, background: SPLIT[i] }} />)}
      </div>
      <ul className="split__legend">
        {parts.map((p, i) => (
          <li key={p.label}><i style={{ background: SPLIT[i] }} aria-hidden="true" /><span>{p.label}</span><b>{pct(p.value / total)}</b></li>
        ))}
      </ul>
    </div>
  );
}

function MiniRows({ title, rows }: { title: string; rows: Row[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="mini">
      <p className="mini__title mono">{title}</p>
      {rows.length ? (
        <ul>{rows.map((r) => <li key={r.label}><span>{r.label || 'Unknown'}</span><b>{total ? pct(r.value / total) : ''}</b></li>)}</ul>
      ) : <p className="blist__empty">None yet.</p>}
    </div>
  );
}

function Journey({ visitors, steps }: { visitors: number; steps: { label: string; value: number }[] }) {
  const per100 = (v: number) => (visitors ? Math.round((v / visitors) * 100) : 0);
  return (
    <ol className="journey">
      <li className="journey__step is-first">
        <span className="journey__label">Visited</span>
        <span className="journey__value">{visitors.toLocaleString('en')}<small>visitors</small></span>
        <i style={{ width: '100%' }} aria-hidden="true" />
      </li>
      {steps.map((s) => (
        <li key={s.label} className="journey__step">
          <span className="journey__label">{s.label}</span>
          <span className="journey__value">{per100(s.value)}<small>{s.value.toLocaleString('en')} times</small></span>
          <i style={{ width: `${Math.min(100, per100(s.value))}%` }} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}
