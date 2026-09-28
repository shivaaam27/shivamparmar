import { Download } from 'lucide-react';
import HoverTip from './HoverTip';

/*
 * Small, quiet charts for the insights cards. Static SVG / HTML (no client
 * code) with hover read-outs through HoverTip; the numbers they show are also
 * written on the card, so nothing depends on hovering.
 */

const fmt = (n: number) => n.toLocaleString('en');
const pct = (v: number, t: number) => (t ? `${Math.round((v / t) * 100)}%` : '');

/** Green, darkest to brightest, for the dark cards. */
const GLOW = ['#1b1e22', '#123826', '#155f37', '#1c8a4c', '#35b56d', '#8fe3b3'];

/**
 * Hour by hour as a strip of thin lines, brighter where it was busier: the
 * whole month's rhythm at a glance. Midnights are marked underneath.
 */
export function Spectrum({ points, timeZone }: { points: { t: number; visitors: number }[]; timeZone: string }) {
  const max = Math.max(1, ...points.map((p) => p.visitors));
  const color = (v: number) => (v ? GLOW[1 + Math.min(GLOW.length - 2, Math.floor(Math.sqrt(v / max) * (GLOW.length - 1)))] : GLOW[0]);
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone });
  const hh = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone });
  const at = (t: number) => `${day.format(t)}, ${hh.format(t)}:00`;
  const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone });
  const peak = points.reduce((b, p) => (p.visitors > b.visitors ? p : b), points[0] ?? { t: 0, visitors: 0 });
  const peakAt = points.indexOf(peak);
  const n = points.length;
  return (
    <HoverTip className="spectrum">
      {peak.visitors > 0 && (
        <p className="spectrum__peak" style={{ left: `${((peakAt + 0.5) / n) * 100}%` }}><b>{fmt(peak.visitors)}</b></p>
      )}
      <div className="spectrum__lines" role="img" aria-label={`Visitors hour by hour. Busiest: ${fmt(peak.visitors)} at ${peak.t ? at(peak.t) : '—'}`}>
        {points.map((p, i) => (
          <i key={p.t} style={{ background: color(p.visitors), height: `${30 + (p.visitors / max) * 70}%` }} className={i === peakAt && peak.visitors ? 'is-peak' : undefined}
            data-tip={`${fmt(p.visitors)} visitors · ${at(p.t)}`} />
        ))}
      </div>
      <div className="spectrum__days" aria-hidden="true">
        {points.map((p, i) => (Number(hh.format(p.t)) === 0 && i % 168 < 24 ? <span key={p.t} style={{ left: `${(i / n) * 100}%` }}>{dayFmt.format(p.t)}</span> : null))}
      </div>
    </HoverTip>
  );
}

/** Page views by weekday × hour on a dark card: when people actually look. */
export function WeekGrid({ grid }: { grid: number[][] }) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const max = Math.max(1, ...grid.flat());
  const color = (v: number) => (v ? GLOW[1 + Math.min(GLOW.length - 2, Math.floor((v / max) * (GLOW.length - 1)))] : GLOW[0]);
  return (
    <HoverTip className="week">
      <div className="week__grid" role="img" aria-label="Page views by weekday and hour over the last four weeks">
        {grid.map((row, d) => (
          <div key={d} className="week__row">
            <span className="week__day">{DAYS[d]}</span>
            {row.map((v, h) => <i key={h} style={{ background: color(v) }} data-tip={`${fmt(v)} page views · ${DAYS[d]} ${hh(h)}–${hh((h + 1) % 24)}`} />)}
          </div>
        ))}
        <div className="week__row week__hours" aria-hidden="true">
          <span className="week__day" />
          {Array.from({ length: 24 }, (_, h) => <span key={h}>{h % 6 === 0 ? hh(h) : ''}</span>)}
        </div>
      </div>
    </HoverTip>
  );
}

/** Plain vertical bars with a few labels underneath. */
export function Bars({ items, unit, dark }: { items: { tip: string; value: number; mark?: string }[]; unit: string; dark?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <HoverTip className={`bars${dark ? ' on-dark' : ''}`}>
      <div className="bars__plot" role="img" aria-label={`${unit}: ${items.map((i) => `${i.tip} ${fmt(i.value)}`).join(', ')}`}>
        {items.map((i, k) => (
          <div key={k} className="bars__col" data-tip={`${fmt(i.value)} ${unit} · ${i.tip}`}>
            <i style={{ height: `${Math.max(i.value ? 4 : 1.5, (i.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="bars__axis" aria-hidden="true">
        {items.map((i, k) => <span key={k}>{i.mark ?? ''}</span>)}
      </div>
    </HoverTip>
  );
}

/** A half circle of ticks, lit up to the value (0–1). */
export function TickArc({ value, caption }: { value: number; caption: string }) {
  const ticks = 44, r = 96, inner = 80;
  const lit = Math.round(Math.max(0, Math.min(1, value)) * ticks);
  return (
    <figure className="arc">
      <svg viewBox="-104 -104 208 110" role="img" aria-label={`${Math.round(value * 100)}% ${caption}`}>
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const a = Math.PI + (i / ticks) * Math.PI;
          const long = i % 11 === 0;
          return (
            <line key={i} x1={Math.cos(a) * (long ? inner - 6 : inner)} y1={Math.sin(a) * (long ? inner - 6 : inner)} x2={Math.cos(a) * r} y2={Math.sin(a) * r}
              className={i <= lit && lit > 0 ? 'arc__tick is-lit' : 'arc__tick'} strokeLinecap="round" />
          );
        })}
      </svg>
      <figcaption><b>{Math.round(value * 100)}<small>%</small></b><span>{caption}</span></figcaption>
    </figure>
  );
}

/** One bar split into parts, with a legend: how a whole divides up. */
export function Segments({ parts }: { parts: { label: string; value: number }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return <p className="empty">Nothing yet for this range.</p>;
  return (
    <div className="segs">
      <HoverTip className="segs__bar">
        <div className="segs__track" role="img" aria-label={parts.map((p) => `${p.label} ${pct(p.value, total)}`).join(', ')}>
          {parts.map((p, i) => <i key={p.label} className={`c${i}`} style={{ flexGrow: p.value }} data-tip={`${p.label} · ${fmt(p.value)} · ${pct(p.value, total)}`} />)}
        </div>
      </HoverTip>
      <ul className="segs__legend">
        {parts.map((p, i) => (
          <li key={p.label}><i className={`c${i}`} aria-hidden="true" /><span>{p.label}</span><b>{pct(p.value, total)}</b><small>{fmt(p.value)}</small></li>
        ))}
      </ul>
    </div>
  );
}

/** A ranked list: name, number, share, and a thin bar behind. */
export function Rows({ rows, unit = 'Visitors', limit = 6, csv, lead }: {
  rows: { label: string; value: number; lead?: string }[]; unit?: string; limit?: number; csv?: string; lead?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const row = (r: { label: string; value: number; lead?: string }) => (
    <li key={r.label}>
      <i style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
      <span className="rows__label">{lead && <span className="rows__lead" aria-hidden="true">{r.lead}</span>}{r.label}</span>
      <span className="rows__val">{fmt(r.value)}</span>
      <span className="rows__pct">{pct(r.value, total)}</span>
    </li>
  );
  return (
    <div className="rows">
      <p className="rows__head"><span>Name</span><span>{unit}{csv && <a href={csv} aria-label="Download as CSV" title="Download CSV"><Download size={12} /></a>}</span></p>
      {rows.length ? (
        <>
          <ol>{rows.slice(0, limit).map(row)}</ol>
          {rows.length > limit && <details><summary>Show all {rows.length}</summary><ol>{rows.slice(limit).map(row)}</ol></details>}
        </>
      ) : <p className="empty">Nothing yet for this range.</p>}
    </div>
  );
}

/** Steps of a visit, each as a share of all visitors. */
export function Funnel({ steps, of }: { steps: { label: string; value: number; note: string }[]; of: number }) {
  return (
    <ol className="funnel">
      {steps.map((s) => {
        const f = of ? Math.min(1, s.value / of) : 0;
        return (
          <li key={s.label}>
            <p className="funnel__label">{s.label}<small>{s.note}</small></p>
            <p className="funnel__val">{(f * 100).toFixed(f && f < 0.1 ? 1 : 0)}%</p>
            <div className="funnel__bar" aria-hidden="true"><i style={{ width: `${f * 100}%` }} /></div>
          </li>
        );
      })}
    </ol>
  );
}
