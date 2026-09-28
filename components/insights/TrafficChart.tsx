'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { niceTicks, smoothPath } from '@/lib/chart';

type Point = { t: number; visitors: number; pageviews: number };
type Unit = 'hour' | 'day' | 'month';
type Key = 'visitors' | 'pageviews';

const SERIES: Record<Key, { name: string; color: string }> = {
  visitors: { name: 'Visitors', color: 'var(--viz-1)' },
  pageviews: { name: 'Page views', color: 'var(--viz-2)' },
};
const H = 280;
const M = { top: 16, right: 12, bottom: 30, left: 40 };

/**
 * The main traffic chart: one measure at a time (switch above), this period as
 * a smooth line over a soft wash, the previous period as a dashed line, and a
 * crosshair that reads out both. Drawn only after it knows its real width.
 */
export default function TrafficChart({ points, previous, unit, timeZone, totals }: {
  points: Point[]; previous: Point[]; unit: Unit; timeZone: string; totals: Record<Key, number>;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number | null>(null);
  const [key, setKey] = useState<Key>('visitors');
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fmtTick = useMemo(() => new Intl.DateTimeFormat('en-GB', unit === 'hour'
    ? { hour: '2-digit', minute: '2-digit', timeZone } : unit === 'month' ? { month: 'short', timeZone } : { day: 'numeric', month: 'short', timeZone }), [unit, timeZone]);
  const fmtFull = useMemo(() => new Intl.DateTimeFormat('en-GB', unit === 'hour'
    ? { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone } : unit === 'month' ? { month: 'long', year: 'numeric', timeZone } : { weekday: 'short', day: 'numeric', month: 'short', timeZone }), [unit, timeZone]);

  const n = points.length;
  const width = w ?? 0;
  const iw = width - M.left - M.right, ih = H - M.top - M.bottom;
  const prev = previous.slice(-n);
  const { top, list } = niceTicks(Math.max(0, ...points.map((p) => p[key]), ...prev.map((p) => p[key])));
  const x = (i: number) => M.left + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const y = (v: number) => M.top + ih - (v / top) * ih;
  const line = smoothPath(points.map((p, i) => [x(i), y(p[key])]));
  const prevOffset = n - prev.length;
  const prevLine = smoothPath(prev.map((p, i) => [x(i + prevOffset), y(p[key])]));
  const color = SERIES[key].color;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 84))));

  const pick = (clientX: number) => {
    const r = wrap.current!.getBoundingClientRect();
    setAt(Math.min(n - 1, Math.max(0, Math.round(((clientX - r.left - M.left) / iw) * (n - 1)))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setAt((a) => Math.max(0, (a ?? n) - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setAt((a) => Math.min(n - 1, (a ?? -1) + 1)); }
    if (e.key === 'Escape') setAt(null);
  };
  const p = at !== null ? points[at] : null;
  const q = at !== null && at - prevOffset >= 0 ? prev[at - prevOffset] : null;

  return (
    <figure className="traffic">
      <div className="traffic__head">
        <div className="seg" role="tablist" aria-label="Measure">
          {(Object.keys(SERIES) as Key[]).map((k) => (
            <button key={k} role="tab" type="button" aria-selected={k === key} onClick={() => setKey(k)}>
              <i style={{ background: SERIES[k].color }} aria-hidden="true" />
              <span className="traffic__seg-name">{SERIES[k].name}</span>
              <b>{totals[k].toLocaleString('en')}</b>
            </button>
          ))}
        </div>
        <figcaption className="traffic__legend mono">
          <span><i className="is-now" style={{ background: color }} />This period</span>
          <span><i className="is-prev" style={{ borderColor: color }} />Previous period</span>
        </figcaption>
      </div>

      <div ref={wrap} className="traffic__plot" tabIndex={0} role="img"
        aria-label={`${SERIES[key].name} over time, with the previous period dashed. Arrow keys read each point.`}
        onPointerMove={(e) => pick(e.clientX)} onPointerLeave={() => setAt(null)}
        onFocus={() => setAt((a) => a ?? n - 1)} onBlur={() => setAt(null)} onKeyDown={onKey}>
        {w === null ? <div style={{ height: H }} /> : (
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
            <defs>
              <linearGradient id="traffic-wash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} stopOpacity=".18" />
                <stop offset="1" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {list.map((v) => (
              <g key={v}>
                <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} className="traffic__grid" />
                <text x={M.left - 10} y={y(v)} dy="0.32em" textAnchor="end" className="traffic__tick">{v.toLocaleString('en')}</text>
              </g>
            ))}
            {points.map((pt, i) => ((i % every === 0 && n - 1 - i >= every * 0.6) || i === n - 1) ? (
              <text key={pt.t} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="traffic__tick">{fmtTick.format(pt.t)}</text>
            ) : null)}
            {n > 0 && <path d={`${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill="url(#traffic-wash)" />}
            <path d={prevLine} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="3 4" />
            <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
            {n > 0 && at === null && (
              <circle cx={x(n - 1)} cy={y(points[n - 1][key])} r={4.5} fill={color} stroke="var(--card)" strokeWidth={2} />
            )}
            {p && at !== null && (
              <g>
                <line x1={x(at)} x2={x(at)} y1={M.top} y2={M.top + ih} className="traffic__cross" />
                <circle cx={x(at)} cy={y(p[key])} r={5} fill={color} stroke="var(--card)" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
        {p && w !== null && at !== null && (
          <div className="chart-tip" style={{ left: Math.min(Math.max(x(at), 80), width - 80), top: Math.max(0, y(p[key]) - 16) }} role="status">
            <p className="chart-tip__date">{fmtFull.format(p.t)}</p>
            <p><i style={{ background: color }} /><b>{p[key].toLocaleString('en')}</b>{SERIES[key].name.toLowerCase()}</p>
            {q && <p className="is-prev"><i style={{ borderColor: color }} /><b>{q[key].toLocaleString('en')}</b>previous period</p>}
          </div>
        )}
      </div>

      <details className="traffic__table">
        <summary className="mono">Show as table</summary>
        <div className="traffic__table-scroll">
          <table>
            <thead><tr><th>{unit === 'hour' ? 'Hour' : unit === 'month' ? 'Month' : 'Day'}</th><th>Visitors</th><th>Page views</th></tr></thead>
            <tbody>
              {w !== null && points.map((pt) => (
                <tr key={pt.t}><td>{fmtFull.format(pt.t)}</td><td>{pt.visitors.toLocaleString('en')}</td><td>{pt.pageviews.toLocaleString('en')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
