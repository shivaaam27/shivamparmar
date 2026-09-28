'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Minus, Plus, RotateCcw } from 'lucide-react';
import type { CityPoint, CountryPoint, GeoModel, Place } from '@/lib/geo';

const W = 1000, H = 520;
const MAX_K = 40;
const SPIKE_W = 4.5;       // half-width of a spike's base, screen px
const SPIKE_MAX = 150;     // tallest spike, screen px

type View = { k: number; x: number; y: number };   // screen = point * k + (x, y)
const HOME: View = { k: 1, x: 0, y: 0 };
const fmt = (n: number) => n.toLocaleString('en');
const share = (v: number, t: number) => (t ? `${Math.round((v / t) * 100)}%` : '');

/** Keep at least part of the map on screen. */
function clamp(v: View): View {
  const k = Math.min(MAX_K, Math.max(1, v.k));
  const minX = W - W * k, minY = H - H * k;
  return { k, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minY, v.y)) };
}

/** The view that fits a box of map coordinates, with some room around it. */
function fit([[x0, y0], [x1, y1]]: [[number, number], [number, number]]): View {
  const pad = 1.6;
  const k = Math.min(MAX_K, Math.max(1, Math.min(W / ((x1 - x0) * pad || 1), H / ((y1 - y0) * pad || 1))));
  return clamp({ k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k });
}

/**
 * The visitor map: a flat world you can zoom and drag, a spike on each
 * country (or, zoomed into one, on each city) as tall as its visitors.
 * Spikes rise when the map appears and grow as new numbers arrive.
 */
export default function FlatMap({ model, rangeLabel }: { model: GeoModel; rangeLabel: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>(HOME);
  const [focus, setFocus] = useState<string | null>(null);
  const [outline, setOutline] = useState<Record<string, string>>({});
  const [hover, setHover] = useState<string | null>(null);
  const [risen, setRisen] = useState(false);
  const drag = useRef<{ x: number; y: number; v: View; moved: boolean } | null>(null);
  const anim = useRef<number>(0);

  const current = useRef(view);
  current.current = view;

  // animate to a view
  const go = useCallback((to: View) => {
    cancelAnimationFrame(anim.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setView(clamp(to)); return; }
    const from = current.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 750);
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      // zoom in log space so it feels even
      const k = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e);
      setView(clamp({ k, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }));
      if (t < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  // spikes rise once the map is on screen
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRisen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const country = focus ? model.countries.find((c) => c.code === focus) ?? null : null;
  const open = async (c: CountryPoint | null) => {
    setHover(null);
    if (!c) { setFocus(null); go(HOME); return; }
    setFocus(c.code);
    go(fit(c.box));
    if (!outline[c.code]) {
      try {
        const res = await fetch(`/api/insights/geo?code=${c.code}`);
        if (res.ok) { const { d } = await res.json(); setOutline((o) => ({ ...o, [c.code]: d })); }
      } catch { /* the coarse outline is fine */ }
    }
  };

  // what the spikes stand for at this zoom
  const showCities = Boolean(country) || view.k >= 3;
  const spikes: (CountryPoint | CityPoint)[] = useMemo(() => {
    if (!showCities) return model.countries;
    return model.cities.filter((c) => !focus || c.country === focus);
  }, [showCities, focus, model.countries, model.cities]);
  const max = Math.max(1, ...spikes.map((s) => s.value));
  const idOf = (s: CountryPoint | CityPoint) => ('code' in s ? s.code : s.id);
  const landMax = Math.max(1, ...model.land.map((l) => l.value));

  // wheel zoom around the pointer, drag to pan
  const toView = (clientX: number, clientY: number) => {
    const r = svg.current!.getBoundingClientRect();
    return [((clientX - r.left) / r.width) * W, ((clientY - r.top) / r.height) * H];
  };
  const zoomAt = (factor: number, cx = W / 2, cy = H / 2) => {
    cancelAnimationFrame(anim.current);
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(1, v.k * factor));
      return clamp({ k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k });
    });
  };
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const [cx, cy] = toView(e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.0022), cx, cy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, v: view, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const r = svg.current!.getBoundingClientRect();
    const dx = ((e.clientX - d.x) / r.width) * W, dy = ((e.clientY - d.y) / r.height) * H;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    if (!d.moved) { d.moved = true; (e.target as Element).setPointerCapture?.(e.pointerId); }
    cancelAnimationFrame(anim.current);
    setView(clamp({ ...d.v, x: d.v.x + dx, y: d.v.y + dy }));
  };
  const onUp = () => { setTimeout(() => { drag.current = null; }, 0); };
  const clicked = (fn: () => void) => () => { if (!drag.current?.moved) fn(); };

  const sx = (x: number) => x * view.k + view.x;
  const sy = (y: number) => y * view.k + view.y;
  const onScreen = (s: { x: number; y: number }) => sx(s.x) > -10 && sx(s.x) < W + 10 && sy(s.y) > -10 && sy(s.y) < H + 10;

  const ordered = [...spikes].filter(onScreen).sort((a, b) => a.y - b.y);
  // name the tallest few, skipping any that would sit on top of another label
  const labelled: string[] = [];
  const placed: [number, number][] = [];
  [...ordered].sort((a, b) => b.value - a.value).slice(0, 6).forEach((s) => {
    const x = sx(s.x), y = sy(s.y) - (s.value / max) * SPIKE_MAX;
    if (placed.every(([px, py]) => Math.abs(px - x) > 90 || Math.abs(py - y) > 22)) { labelled.push(idOf(s)); placed.push([x, y]); }
  });

  const hovered = ordered.find((s) => idOf(s) === hover) ?? null;
  const total = model.totals.visitors;
  const listRows = country
    ? { regions: model.regions[country.code] ?? [], cities: model.cities.filter((c) => c.country === country.code) }
    : null;

  return (
    <div className="map">
      <div className="map__stage" data-noswipe>
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className={`map__svg${drag.current?.moved ? ' is-dragging' : ''}`}
          role="img"
          aria-label={country ? `Map of ${country.name} with a spike for each city, as tall as its visitors` : 'World map with a spike for each country, as tall as its visitors'}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        >
          <defs>
            <linearGradient id="spike-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--map-spike)" stopOpacity=".55" />
              <stop offset="1" stopColor="var(--map-spike)" stopOpacity=".12" />
            </linearGradient>
          </defs>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {model.land.map((l) => {
              const visited = l.value > 0;
              const t = visited ? Math.sqrt(l.value / landMax) : 0;
              return (
                <path key={l.id} d={l.d} vectorEffect="non-scaling-stroke"
                  className={`map__land${visited ? ' is-visited' : ''}${l.id === focus ? ' is-focus' : ''}${l.id === focus && outline[l.id] ? ' is-replaced' : ''}`}
                  style={visited ? { fillOpacity: 0.12 + t * 0.3 } : undefined}
                  onClick={visited ? clicked(() => open(model.countries.find((c) => c.code === l.id) ?? null)) : undefined} />
              );
            })}
            {focus && outline[focus] && <path d={outline[focus]} className="map__outline" vectorEffect="non-scaling-stroke" onClick={clicked(() => {})} />}
          </g>

          {/* live visitors: a soft pulse where people are right now */}
          {!showCities && model.countries.filter((c) => c.live > 0 && onScreen(c)).map((c) => (
            <g key={`live-${c.code}`} transform={`translate(${sx(c.x)} ${sy(c.y)})`} className="map__live">
              <circle r={5} /><circle r={5} className="map__pulse" />
            </g>
          ))}

          {ordered.map((s, i) => {
            const id = idOf(s);
            const h = Math.max(6, (s.value / max) * SPIKE_MAX);
            const pick = 'code' in s && !country ? () => open(s as CountryPoint) : undefined;
            return (
              <g key={id} transform={`translate(${sx(s.x).toFixed(1)} ${sy(s.y).toFixed(1)})`}
                className={`map__spike${hover === id ? ' is-active' : ''}${pick ? ' is-link' : ''}`}
                onPointerEnter={() => setHover(id)} onPointerLeave={() => setHover(null)} onClick={pick ? clicked(pick) : undefined}>
                <g className="map__spike-body" style={{ transform: `scaleY(${risen ? h / 100 : 0})`, transitionDelay: `${Math.min(i, 30) * 25}ms` }}>
                  <path d={`M${-SPIKE_W},0L0,-100L${SPIKE_W},0Z`} fill="url(#spike-fill)" stroke="var(--map-spike)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
                </g>
                <ellipse rx={SPIKE_W + 1} ry={1.6} className="map__spike-base" />
                <rect x={-10} y={-h - 6} width={20} height={h + 10} fill="transparent" />
              </g>
            );
          })}

          {risen && ordered.filter((s) => labelled.includes(idOf(s))).map((s) => {
            const h = Math.max(6, (s.value / max) * SPIKE_MAX);
            return (
              <text key={`l-${idOf(s)}`} x={sx(s.x) + 7} y={sy(s.y) - h + 4} className="map__label">
                <tspan className="map__label-num">{fmt(s.value)}</tspan> {s.name}
              </text>
            );
          })}
        </svg>

        {hovered && (
          <div className="map__tip" role="status"
            style={{ left: `${(sx(hovered.x) / W) * 100}%`, top: `${((sy(hovered.y) - Math.max(6, (hovered.value / max) * SPIKE_MAX)) / H) * 100}%` }}>
            <b>{fmt(hovered.value)}</b> visitors<span>{hovered.name}{'code' in hovered && !country ? ' · click to zoom in' : ''}</span>
          </div>
        )}

        <div className="map__controls">
          <button type="button" onClick={() => zoomAt(1.6)} aria-label="Zoom in"><Plus size={16} /></button>
          <button type="button" onClick={() => zoomAt(1 / 1.6)} aria-label="Zoom out"><Minus size={16} /></button>
          <button type="button" onClick={() => open(null)} aria-label="Show the whole world"><RotateCcw size={15} /></button>
        </div>
        <div className="map__legend mono" aria-hidden="true">
          <svg width="44" height="30" viewBox="0 0 44 30">
            <path d="M6,28L10,14L14,28Z" fill="url(#spike-fill)" stroke="var(--map-spike)" />
            <path d="M24,28L28,2L32,28Z" fill="url(#spike-fill)" stroke="var(--map-spike)" />
          </svg>
          <span>Height is visitors · {showCities ? 'by city' : 'by country'}</span>
        </div>
      </div>

      <aside className="map__panel" aria-label="Visitors by place">
        {country && listRows ? (
          <>
            <button type="button" className="map__back mono" onClick={() => open(null)}><ArrowLeft size={14} aria-hidden="true" />All countries</button>
            <div className="map__head">
              <p className="tiny">{country.name}</p>
              <p className="map__big">{fmt(country.value)}<small>visitors · {share(country.value, total)} of all</small></p>
            </div>
            <Places title="Cities" rows={listRows.cities.map((c) => ({ name: c.name, value: c.value }))} total={country.value}
              hover={hover} idOf={(p) => `${country.code}:${p.name}`} onHover={setHover} empty="No cities placed yet." />
            <Places title="Regions" rows={listRows.regions} total={country.value} empty="No regions reported yet." />
          </>
        ) : (
          <>
            <div className="map__head">
              <p className="tiny">{rangeLabel}</p>
              <p className="map__big">{model.totals.countries}<small>{model.totals.countries === 1 ? 'country' : 'countries'} · {model.totals.cities} cities</small></p>
            </div>
            <Places title="Countries" rows={model.countries.map((c) => ({ name: c.name, value: c.value, id: c.code }))} total={total}
              hover={hover} idOf={(p) => (p as Place & { id: string }).id} onHover={setHover}
              onPick={(p) => open(model.countries.find((c) => c.code === (p as Place & { id: string }).id) ?? null)} empty="No visitors yet." />
            {model.unplaced.length > 0 && (
              <p className="map__note">{model.unplaced.length} {model.unplaced.length === 1 ? 'city' : 'cities'} couldn’t be placed on the map.</p>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function Places({ title, rows, total, empty, hover, idOf, onHover, onPick }: {
  title: string; rows: Place[]; total: number; empty: string;
  hover?: string | null; idOf?: (p: Place) => string; onHover?: (id: string | null) => void; onPick?: (p: Place) => void;
}) {
  const [all, setAll] = useState(false);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const shown = all ? rows : rows.slice(0, 7);
  return (
    <section className="map__list">
      <p className="map__list-head tiny"><span>{title}</span><span>Visitors</span></p>
      {rows.length ? (
        <ol>
          {shown.map((r) => {
            const id = idOf?.(r);
            const Row = onPick ? 'button' : 'div';
            return (
              <li key={r.name}>
                <Row {...(onPick ? { type: 'button' as const, onClick: () => onPick(r) } : {})}
                  className={`map__row${id && hover === id ? ' is-active' : ''}${onPick ? ' is-link' : ''}`}
                  onPointerEnter={() => id && onHover?.(id)} onPointerLeave={() => onHover?.(null)}>
                  <span className="map__row-name">{r.name}</span>
                  <span className="map__row-val">{fmt(r.value)}<small>{share(r.value, total)}</small></span>
                  <i style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
                </Row>
              </li>
            );
          })}
        </ol>
      ) : <p className="map__note">{empty}</p>}
      {rows.length > 7 && <button type="button" className="map__more mono" onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${rows.length}`}</button>}
    </section>
  );
}
