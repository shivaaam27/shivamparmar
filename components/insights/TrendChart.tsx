'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Point = { t: number; visitors: number; pageviews: number };
type Unit = 'hour' | 'day' | 'month';

const SERIES = [
  { key: 'visitors', name: 'Visitors', color: 'var(--viz-1)' },
  { key: 'pageviews', name: 'Page views', color: 'var(--viz-2)' },
] as const;

const H = 260;
const M = { top: 12, right: 16, bottom: 28, left: 44 };

/** 0–4 "nice" ticks for a max value: 1, 2 or 5 × a power of ten. */
function ticks(max: number) {
  if (max <= 0) return { top: 4, list: [0, 1, 2, 3, 4] };
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const top = Math.ceil(max / step) * step;
  return { top, list: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

export default function TrendChart({ points, unit, timeZone }: { points: Point[]; unit: Unit; timeZone: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  // null until measured in the browser: the chart draws at its real width, with the browser's own date formats
  const [w, setW] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fmtTick = useMemo(() => new Intl.DateTimeFormat('en-GB', unit === 'hour'
    ? { hour: '2-digit', minute: '2-digit', timeZone }
    : unit === 'month' ? { month: 'short', timeZone } : { day: 'numeric', month: 'short', timeZone }), [unit, timeZone]);
  const fmtFull = useMemo(() => new Intl.DateTimeFormat('en-GB', unit === 'hour'
    ? { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone }
    : unit === 'month' ? { month: 'long', year: 'numeric', timeZone } : { weekday: 'short', day: 'numeric', month: 'short', timeZone }), [unit, timeZone]);

  const n = points.length;
  const width = w ?? 0;
  const iw = width - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const { top, list } = ticks(Math.max(...points.map((p) => Math.max(p.visitors, p.pageviews)), 0));
  const x = (i: number) => M.left + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const y = (v: number) => M.top + ih - (v / top) * ih;
  const line = (k: 'visitors' | 'pageviews') => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
  const area = n ? `${line('visitors')}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z` : '';
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 90))));

  const pick = (clientX: number) => {
    const r = wrap.current!.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - M.left) / iw) * (n - 1));
    setAt(Math.min(n - 1, Math.max(0, i)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setAt((a) => Math.max(0, (a ?? n) - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setAt((a) => Math.min(n - 1, (a ?? -1) + 1)); }
    if (e.key === 'Escape') setAt(null);
  };

  const p = at !== null ? points[at] : null;
  const tipLeft = at !== null ? Math.min(Math.max(x(at), 90), width - 90) : 0;

  return (
    <figure className="trend">
      <figcaption className="trend__legend">
        {SERIES.map((s) => (
          <span key={s.key}><i style={{ background: s.color }} />{s.name}</span>
        ))}
      </figcaption>
      <div
        ref={wrap}
        className="trend__plot"
        tabIndex={0}
        role="img"
        aria-label="Visitors and page views over time. Use the arrow keys to read each point."
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setAt(null)}
        onFocus={() => setAt((a) => a ?? n - 1)}
        onBlur={() => setAt(null)}
        onKeyDown={onKey}
      >
        {w === null ? <div style={{ height: H }} /> : (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
          {list.map((v) => (
            <g key={v}>
              <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} className="trend__grid" />
              <text x={M.left - 10} y={y(v)} dy="0.32em" textAnchor="end" className="trend__tick">{v.toLocaleString('en')}</text>
            </g>
          ))}
          {points.map((pt, i) => (i % every === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < every * 0.6) ? (
            <text key={pt.t} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="trend__tick">{fmtTick.format(pt.t)}</text>
          ) : null)}
          <path d={area} fill="var(--viz-1)" fillOpacity={0.1} />
          <path d={line('pageviews')} fill="none" stroke="var(--viz-2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={line('visitors')} fill="none" stroke="var(--viz-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {p && at !== null && (
            <g>
              <line x1={x(at)} x2={x(at)} y1={M.top} y2={M.top + ih} className="trend__cross" />
              {SERIES.map((s) => (
                <circle key={s.key} cx={x(at)} cy={y(p[s.key])} r={4.5} fill={s.color} stroke="var(--paper)" strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        )}
        {p && w !== null && (
          <div className="trend__tip" style={{ left: tipLeft }} role="status">
            <p className="trend__tip-date">{fmtFull.format(p.t)}</p>
            {SERIES.map((s) => (
              <p key={s.key}><i style={{ background: s.color }} /><b>{p[s.key].toLocaleString('en')}</b>{s.name}</p>
            ))}
          </div>
        )}
      </div>
      <details className="trend__table">
        <summary className="mono">Show as table</summary>
        <div className="trend__table-scroll">
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
