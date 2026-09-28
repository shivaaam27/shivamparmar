'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Globe2, MapPin } from 'lucide-react';
import type { Bar, GeoModel, Place, Shape } from '@/lib/geo';

/* The plane is tilted like a table seen from the front-left: rotate, then squash. */
const W = 1000, H = 560;
const TILT = 0.12;      // radians of rotation within the plane
const SQUASH = 0.6;     // how flat the plane looks
const DEPTH = 7;        // thickness of the land plate, px
const MAX_BAR = 200;    // tallest bar, px
const cos = Math.cos(TILT), sin = Math.sin(TILT);
const iso = (x: number, y: number): [number, number] => [x * cos - y * sin, (x * sin + y * cos) * SQUASH];
const MATRIX = `matrix(${cos} ${sin * SQUASH} ${-sin} ${cos * SQUASH} 0 0)`;

/* bounds of the tilted plane, plus room above for bars */
const corners = [iso(0, 0), iso(W, 0), iso(W, H), iso(0, H)];
const minX = Math.min(...corners.map((c) => c[0])), maxX = Math.max(...corners.map((c) => c[0]));
const minY = Math.min(...corners.map((c) => c[1])), maxY = Math.max(...corners.map((c) => c[1]));
const VB = { x: minX - 10, y: minY - MAX_BAR - 20, w: maxX - minX + 20, h: maxY - minY + MAX_BAR + DEPTH + 30 };

/* amber, dim → bright: more visitors read brighter against the dark room */
const RAMP = ['#6e4b27', '#9a672f', '#c4843a', '#e3a553', '#f7cb7c'];
const stepOf = (v: number, max: number) => RAMP[Math.min(RAMP.length - 1, Math.floor(Math.sqrt(v / Math.max(1, max)) * RAMP.length))];
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return `rgb(${c.join(',')})`;
};
const fmt = (n: number) => n.toLocaleString('en');
const pct = (v: number, total: number) => (total ? `${Math.round((v / total) * 100)}%` : '');

/** A square column standing on the plane at (x, y), `h` px tall. Faces drawn back to front. */
function Prism({ bar, size, h, color, active, onEnter, onLeave, onClick }: {
  bar: Bar; size: number; h: number; color: string; active: boolean;
  onEnter: () => void; onLeave: () => void; onClick?: () => void;
}) {
  const s = size / 2;
  const base = [iso(bar.x - s, bar.y - s), iso(bar.x + s, bar.y - s), iso(bar.x + s, bar.y + s), iso(bar.x - s, bar.y + s)];
  const top = base.map(([x, y]) => [x, y - h] as [number, number]);
  const cy = base.reduce((t, p) => t + p[1], 0) / 4;
  const faces = base.map((a, i) => {
    const b = base[(i + 1) % 4];
    const front = (a[1] + b[1]) / 2 > cy;                       // faces toward the viewer
    const lit = b[0] - a[0] > 0;                                // lit from the left
    return { front, pts: [a, b, top[(i + 1) % 4], top[i]], fill: shade(color, lit ? 0.8 : 0.58) };
  }).sort((p, q) => Number(p.front) - Number(q.front));
  const poly = (pts: [number, number][]) => pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
  return (
    <g
      className={`geo__bar${active ? ' is-active' : ''}${onClick ? ' is-link' : ''}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      {faces.map((f, i) => <polygon key={i} points={poly(f.pts)} fill={f.fill} />)}
      <polygon points={poly(top)} fill={active ? '#fff3dc' : color} />
      {/* a bigger invisible target than the column itself */}
      <rect x={Math.min(...base.map((p) => p[0])) - 6} y={Math.min(...top.map((p) => p[1])) - 6}
        width={size * 1.4 + 12} height={h + size + 12} fill="transparent" />
    </g>
  );
}

/**
 * The land as a thick plate. In the world view every country is part of the
 * plate; zoomed in, only the chosen country is raised and its neighbours lie
 * flat and faint around it for context.
 */
function Land({ shapes, focusId, max }: { shapes: Shape[]; focusId?: string; max: number }) {
  const uid = useId().replace(/:/g, '');
  const raised = focusId ? shapes.filter((s) => s.id === focusId) : shapes;
  const flat = focusId ? shapes.filter((s) => s.id !== focusId) : [];
  const fill = (s: Shape) => (s.value ? shade(stepOf(s.value, max), focusId ? 0.34 : 0.42) : '#2a2622');
  // the outlines are written once and reused for each layer of the plate's edge
  return (
    <g aria-hidden="true">
      <defs>
        <g id={`plate-${uid}`}>{raised.map((s) => <path key={s.id} d={s.d} />)}</g>
      </defs>
      <g transform={MATRIX}>
        {flat.map((s) => <path key={s.id} d={s.d} fill="#1b1917" stroke="#34302b" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />)}
      </g>
      {[DEPTH, DEPTH * 0.75, DEPTH * 0.5, DEPTH * 0.25].map((dy) => (
        <g key={dy} transform={`translate(0 ${dy}) ${MATRIX}`} fill="#0a0908"><use href={`#plate-${uid}`} /></g>
      ))}
      <g transform={MATRIX}>
        {raised.map((s) => (
          <path key={s.id} d={s.d} fill={fill(s)} stroke="#4a443d" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </g>
  );
}

export default function GeoExplorer({ model, range, rangeLabel }: { model: GeoModel; range: string; rangeLabel: string }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Record<string, { land: Shape[]; bars: Bar[] }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [grow, setGrow] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  const base = focus ? model.countries.find((c) => c.code === focus) ?? null : null;
  const detail = base && loaded[base.code] ? { ...base, ...loaded[base.code] } : null;
  const bars = detail ? detail.bars : model.world.bars;
  const land = detail ? detail.land : model.world.land;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const size = detail ? 16 : 12;
  const total = model.world.bars.reduce((t, b) => t + b.value, 0);
  const hasDetail = (code: string) => model.countries.some((c) => c.code === code);

  // raise the bars when the map first scrolls into view, and again on every zoom
  const raise = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setGrow(1); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      setGrow(1 - (1 - t) ** 3);
      if (t < 1) requestAnimationFrame(tick);
    };
    setGrow(0);
    requestAnimationFrame(tick);
  };
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !seen.current) { seen.current = true; raise(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const zoom = async (code: string | null) => {
    setHover(null);
    if (code && !loaded[code]) {
      setLoading(code);
      try {
        const res = await fetch(`/api/insights/geo?code=${code}&range=${range}`);
        if (!res.ok) throw new Error(String(res.status));
        const part = (await res.json()) as { land: Shape[]; bars: Bar[] };
        setLoaded((l) => ({ ...l, [code]: part }));
      } catch {
        setLoading(null);
        return;                       // stay on the world view if it can't load
      }
      setLoading(null);
    }
    setFocus(code);
    if (seen.current) raise();
  };

  const ordered = useMemo(() => [...bars].sort((a, b) => iso(a.x, a.y)[1] - iso(b.x, b.y)[1]), [bars]);
  const hovered = bars.find((b) => b.id === hover) ?? null;
  const tip = hovered ? (() => {
    const [x, y] = iso(hovered.x, hovered.y);
    const h = 4 + (hovered.value / max) * MAX_BAR * grow;
    return { left: `${((x - VB.x) / VB.w) * 100}%`, top: `${((y - h - VB.y) / VB.h) * 100}%` };
  })() : null;

  const top = bars.length ? [...bars].sort((a, b) => b.value - a.value)[0] : null;

  return (
    <div className="geo">
      <div className="geo__stage" ref={stage}>
        {/* GitHub-style callouts */}
        <div className="geo__callouts">
          {detail ? (
            <>
              <Callout label={detail.name} value={fmt(detail.value)} unit="visitors" sub={`${pct(detail.value, total)} of everyone · ${rangeLabel}`} />
              {top && <Callout label="Busiest city" value={fmt(top.value)} unit={top.name} sub={pct(top.value, detail.value) + ' of this country'} />}
            </>
          ) : (
            <>
              <Callout label="Countries reached" value={String(model.totals.countries)} unit="countries" sub={rangeLabel} />
              {top && <Callout label="Most visitors from" value={fmt(top.value)} unit={top.name} sub={`${pct(top.value, total)} of everyone`} />}
            </>
          )}
        </div>

        <div className={`geo__canvas${loading ? ' is-loading' : ''}`} key={detail ? detail.code : 'world'} aria-busy={Boolean(loading)}>
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="img"
            aria-label={detail ? `Map of ${detail.name} with a column for each city, as tall as its visitors` : 'World map with a column for each country, as tall as its visitors'}>
            <Land shapes={land} focusId={focus ?? undefined} max={max} />
            {/* country shapes are also clickable in the world view */}
            {!detail && (
              <g transform={MATRIX}>
                {model.world.land.filter((s) => s.value && hasDetail(s.id)).map((s) => (
                  <path key={s.id} d={s.d} className="geo__hit" fill="transparent"
                    onPointerEnter={() => setHover(s.id)} onPointerLeave={() => setHover(null)} onClick={() => zoom(s.id)} />
                ))}
              </g>
            )}
            {ordered.map((b) => (
              <Prism key={b.id} bar={b} size={size} h={Math.max(2, (4 + (b.value / max) * MAX_BAR) * grow)}
                color={stepOf(b.value, max)} active={hover === b.id}
                onEnter={() => setHover(b.id)} onLeave={() => setHover(null)}
                onClick={!detail && hasDetail(b.id) ? () => zoom(b.id) : undefined} />
            ))}
          </svg>
          {hovered && tip && (
            <div className="geo__tip" style={tip} role="status">
              <b>{fmt(hovered.value)}</b> visitors
              <span>{hovered.name}{!detail && hasDetail(hovered.id) ? ' · click to look inside' : ''}</span>
            </div>
          )}
        </div>

        <div className="geo__key mono" aria-hidden="true">
          <span>Fewer</span>{RAMP.map((c) => <i key={c} style={{ background: c }} />)}<span>More visitors</span>
        </div>
      </div>

      {/* the same numbers as a list, and the way in and out */}
      <aside className="geo__panel" aria-label="Visitors by place">
        <nav className="geo__crumbs mono" aria-label="Map level">
          <button type="button" onClick={() => zoom(null)} aria-current={!detail ? 'page' : undefined}>
            <Globe2 size={14} aria-hidden="true" />World
          </button>
          {detail && <><span aria-hidden="true">/</span><span aria-current="page">{detail.name}</span></>}
          {loading && <span className="geo__loading">Opening {model.countries.find((c) => c.code === loading)?.name}…</span>}
        </nav>

        {detail ? (
          <>
            <button type="button" className="geo__back mono" onClick={() => zoom(null)}><ArrowLeft size={14} aria-hidden="true" />All countries</button>
            <PlaceList title="Regions" rows={detail.regions} total={detail.value} empty="No regions reported yet." />
            <PlaceList title="Cities" rows={detail.cities} total={detail.value} empty="No cities placed yet."
              hover={hover} idOf={(p) => `${detail.code}:${p.name}`} onHover={setHover} />
          </>
        ) : (
          <>
            <PlaceList title="Countries" rows={model.world.bars.slice().sort((a, b) => b.value - a.value).map((b) => ({ name: b.name, value: b.value, id: b.id }))}
              total={total} empty="No visitors yet." hover={hover} idOf={(p) => (p as Place & { id: string }).id} onHover={setHover}
              onPick={(p) => { const id = (p as Place & { id: string }).id; if (hasDetail(id)) zoom(id); }}
              canPick={(p) => hasDetail((p as Place & { id: string }).id)} />
            {model.unplaced.length > 0 && (
              <p className="geo__note">{model.unplaced.length} {model.unplaced.length === 1 ? 'city' : 'cities'} couldn’t be placed on the map ({model.unplaced.slice(0, 3).map((c) => c.name).join(', ')}{model.unplaced.length > 3 ? '…' : ''}).</p>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function Callout({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="geo__callout">
      <p className="geo__callout-label">{label}</p>
      <p className="geo__callout-value"><b>{value}</b><span>{unit}<small>{sub}</small></span></p>
    </div>
  );
}

function PlaceList({ title, rows, total, empty, hover, idOf, onHover, onPick, canPick }: {
  title: string; rows: Place[]; total: number; empty: string;
  hover?: string | null; idOf?: (p: Place) => string; onHover?: (id: string | null) => void;
  onPick?: (p: Place) => void; canPick?: (p: Place) => boolean;
}) {
  const [all, setAll] = useState(false);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const shown = all ? rows : rows.slice(0, 8);
  return (
    <section className="geo__list">
      <p className="geo__list-head mono"><span><MapPin size={13} aria-hidden="true" />{title}</span><span>Visitors</span></p>
      {rows.length ? (
        <ol>
          {shown.map((r) => {
            const id = idOf?.(r);
            const pickable = canPick?.(r);
            const Tag = pickable ? 'button' : 'div';
            return (
              <li key={r.name}>
                <Tag
                  {...(pickable ? { type: 'button' as const, onClick: () => onPick?.(r) } : {})}
                  className={`geo__row${id && hover === id ? ' is-active' : ''}${pickable ? ' is-link' : ''}`}
                  onPointerEnter={() => id && onHover?.(id)} onPointerLeave={() => onHover?.(null)}
                >
                  <span className="geo__row-name">{r.name}{pickable && <ArrowUpRight size={13} aria-hidden="true" />}</span>
                  <span className="geo__row-value">{fmt(r.value)}<small>{pct(r.value, total)}</small></span>
                  <i style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
                </Tag>
              </li>
            );
          })}
        </ol>
      ) : <p className="geo__note">{empty}</p>}
      {rows.length > 8 && (
        <button type="button" className="geo__more mono" onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${rows.length}`}</button>
      )}
    </section>
  );
}
