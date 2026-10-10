'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { track } from '@/lib/track';
import Wheel, { type WheelItem } from './Wheel';
import PhotoCarousel from './ui/PhotoCarousel';

/** A picture, or a video (then `src` is its poster). */
export type Shot = { src: string; alt: string; w: number; h: number; project: string; slug: string; n: number; video?: string; screen?: boolean; linked?: boolean; compare?: { video: string; poster: string; label: string; otherLabel: string } };
/** A collection (sub-category); `page` and `summary` come from its project. */
export type Collection = { slug: string; name: string; shots: Shot[]; page?: string; summary?: string };
export type Cat = { slug: string; name: string; collections: Collection[] };

type Kind = 'photos' | 'videos';
type Sel = { c: string | null; s: string | null; t?: Kind | null };
const ALL = '__all';
const KINDS: { key: Kind; label: string }[] = [{ key: 'photos', label: 'Photos' }, { key: 'videos', label: 'Videos' }];
const isKind = (k: string | null): k is Kind => k === 'photos' || k === 'videos';
const ofKind = (t: Kind) => (p: Shot) => (t === 'videos' ? Boolean(p.video) : !p.video);

/** /work → all, /work/photography → a category, ?s=mikumi → one collection, ?t=videos → just the videos. */
function readSel(cats: Cat[]): Sel {
  const seg = window.location.pathname.replace(/\/+$/, '').split('/')[2] ?? null;
  const cat = cats.find((c) => c.slug === seg);
  const q = new URLSearchParams(window.location.search);
  const s = q.get('s'), t = q.get('t');
  return { c: cat?.slug ?? null, s: cat?.collections.some((x) => x.slug === s) ? s : null, t: cat && isKind(t) ? t : null };
}
const pathOf = ({ c, s, t }: Sel) => {
  const q = new URLSearchParams();
  if (c && s) q.set('s', s);
  if (c && t) q.set('t', t);
  const qs = q.toString();
  return `/work${c ? `/${c}` : ''}${qs ? `?${qs}` : ''}`;
};

/**
 * The work page: a header with the title and two picker wheels beside it
 * (category, then its collections), and every picture below edge to edge in
 * same-size tiles. Once the header scrolls away a slim copy of it slides down
 * from the top, so the filters are always at hand. Choices live in the
 * address (/work, /work/photography, /work/photography?s=mikumi) and changing
 * one crossfades quickly (where the browser supports view transitions).
 * Clicking a picture opens the carousel over exactly the pictures on show.
 */
export default function WorkBrowser({ cats, initial }: { cats: Cat[]; initial: Sel }) {
  const [sel, setSel] = useState<Sel>(initial);
  const [viewing, setViewing] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);
  const head = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const closeViewer = useCallback(() => setViewing(null), []);

  useEffect(() => {
    const sync = () => setSel(readSel(cats));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [cats]);

  // the slim bar shows once the big header has scrolled out of view
  useEffect(() => {
    const el = head.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = useCallback((next: Sel) => {
    const c = cats.find((x) => x.slug === next.c);
    const s = c?.collections.find((x) => x.slug === next.s);
    track(c ? `Work · ${c.name}${s ? ` › ${s.name}` : ''}` : 'Work · All');
    window.history.pushState(null, '', pathOf(next));
    document.title = `${s?.name ?? c?.name ?? 'Work'} — Fabra Labs`;

    const apply = () => {
      flushSync(() => setSel(next));
      // changed from the slim bar, down among the pictures: start the new set from the top
      const h = head.current;
      if (h && window.scrollY > h.offsetTop + h.offsetHeight) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        lenis?.scrollTo(0, { immediate: true, force: true });
      }
    };
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (vt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) vt.call(document, apply);
    else apply();
  }, [cats, lenis]);

  const cat = cats.find((c) => c.slug === sel.c) ?? null;
  const col = cat?.collections.find((x) => x.slug === sel.s) ?? null;
  // what's in the chosen category and collection, then narrowed to photos or videos
  const inCol = useMemo(() => {
    const cs = cat ? [cat] : cats;
    return cs.flatMap((c) => c.collections.filter((x) => !col || x === col).flatMap((x) => x.shots));
  }, [cats, cat, col]);
  const shots = useMemo(() => (sel.t ? inCol.filter(ofKind(sel.t)) : inCol), [inCol, sel.t]);
  // Systems, tools, websites: when the view mixes projects, each project's screens
  // become ONE stacked tile (its first screen on top) that opens the project page,
  // so a project with many screens doesn't fill the page. One project chosen: every screen.
  const items = useMemo(() => {
    const out: ({ kind: 'shot'; p: Shot; i: number } | { kind: 'stack'; ps: Shot[] })[] = [];
    const stacks = new Map<string, Shot[]>();
    shots.forEach((p, i) => {
      if (col || !p.linked) return void out.push({ kind: 'shot', p, i });
      const ps = stacks.get(p.slug);
      if (ps) return void ps.push(p);
      const fresh = [p];
      stacks.set(p.slug, fresh);
      out.push({ kind: 'stack', ps: fresh });
    });
    // A stack leads with landscape screens (the system itself), then other landscape
    // pictures, so its cards share one shape; a "stack" of one is just a tile.
    const rank = (p: Shot) => (p.w > p.h ? (p.screen ? 0 : 1) : 2);
    return out.map((it) => {
      if (it.kind !== 'stack') return it;
      if (it.ps.length === 1) return { kind: 'shot' as const, p: it.ps[0], i: shots.indexOf(it.ps[0]) };
      return { kind: 'stack' as const, ps: [...it.ps].sort((a, b) => rank(a) - rank(b)) };
    });
  }, [shots, col]);
  // screens (stacks, website recordings) go in the wide row; photos in the grid below
  const isWide = (it: (typeof items)[number]) => it.kind === 'stack' || (it.p.screen && it.p.w > it.p.h);
  const wide = items.filter(isWide), rest = items.filter((it) => !isWide(it));
  const tile = (it: (typeof items)[number]) => it.kind === 'stack' ? (
            <figure key={`stack-${it.ps[0].slug}`} className={`wb__shot wb__shot--screen wb__shot--stack${it.ps[0].w < it.ps[0].h ? ' is-tall' : ''}`}
              style={{ '--ar': (it.ps[0].w / it.ps[0].h).toFixed(4) } as React.CSSProperties}>
              <Link className="wb__stack" href={`/work/${it.ps[0].slug}`} onClick={() => track(`Open project · ${it.ps[0].project}`)}
                aria-label={`${it.ps[0].project}: ${it.ps.length} screens. Open the project`}>
                {/* the next two screens peek out behind the first, like a stack of cards */}
                {it.ps.slice(1, 3).reverse().map((p, k, back) => (
                  <span key={p.src} className={`wb__stack-card wb__stack-card--${back.length - k}`} aria-hidden="true">
                    <img src={p.src} alt="" width={p.w} height={p.h} loading="lazy" />
                  </span>
                ))}
                <span className="wb__media"><img src={it.ps[0].src} alt={it.ps[0].alt} width={it.ps[0].w} height={it.ps[0].h} loading="eager" /></span>
              </Link>
              <Link className="wb__shot-link mono" href={`/work/${it.ps[0].slug}`} onClick={() => track(`Open project · ${it.ps[0].project}`)}>
                <span>{it.ps[0].project}</span><span className="wb__stack-count">{it.ps.length} screens <span aria-hidden="true">↗</span></span>
              </Link>
            </figure>
          ) : (({ p, i }) => (
            <figure key={p.src} className={`wb__shot${p.video ? ' wb__shot--video' : ''}${p.screen ? ' wb__shot--screen' : ''}`} style={p.screen ? { '--ar': (p.w / p.h).toFixed(4) } as React.CSSProperties : undefined}>
              <button type="button" onClick={() => { setViewing(i); track(`View ${p.video ? 'video' : 'photo'} · ${p.project}`); }}
                aria-label={`View ${p.project}, ${p.video ? 'video' : 'photo'} ${p.n}: ${p.alt}`}
                onPointerEnter={p.video ? (e) => { if (e.pointerType === 'mouse') e.currentTarget.querySelector('video')?.play().catch(() => {}); } : undefined}
                onPointerLeave={p.video ? (e) => { const v = e.currentTarget.querySelector('video'); if (v) { v.pause(); v.currentTime = 0; } } : undefined}>
                {/* a screen is shown whole, framed inside the tile; a photo fills it */}
                <span className="wb__media">
                  <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={i < 10 ? 'eager' : 'lazy'} />
                  {/* a silent preview plays while the mouse is over it */}
                  {p.video && <video src={p.video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
                </span>
                {p.video && <span className="wb__play" aria-hidden="true"><Play size={12} fill="currentColor" strokeWidth={0} /></span>}
              </button>
              {p.linked && (
                <Link className="wb__shot-link mono" href={`/work/${p.slug}`} onClick={() => track(`Open project · ${p.project}`)}>
                  <span>{p.project}</span><span aria-hidden="true">↗</span>
                </Link>
              )}
            </figure>
          ))(it);
  // a category with videos gets a third wheel: all, photos, videos
  const hasVideo = Boolean(cat?.collections.some((x) => x.shots.some((p) => p.video)));

  const count = (c: Cat) => c.collections.reduce((n, x) => n + x.shots.length, 0);
  const catItems: WheelItem[] = [
    { key: ALL, label: 'All', count: cats.reduce((n, c) => n + count(c), 0) },
    ...cats.map((c) => ({ key: c.slug, label: c.name, count: count(c) })),
  ];
  const colItems: WheelItem[] = cat ? [
    { key: ALL, label: 'All', count: count(cat) },
    ...cat.collections.map((x) => ({ key: x.slug, label: x.name, count: x.shots.length, disabled: !x.shots.length })),
  ] : [];
  const kindItems: WheelItem[] = [
    { key: ALL, label: 'All', count: inCol.length },
    ...KINDS.map((k) => { const n = inCol.filter(ofKind(k.key)).length; return { key: k.key, label: k.label, count: n, disabled: !n }; }),
  ];

  const title = col?.name ?? cat?.name ?? 'Work';
  const bar = (slim: boolean) => (
    <>
      <div className="wb__titles">
        <p className="wb__crumb mono">
          {cat ? <button type="button" tabIndex={slim ? -1 : undefined} onClick={() => choose({ c: null, s: null })}>Work</button> : 'Selected'}
          {cat && <><span aria-hidden="true"> / </span>{col ? <button type="button" tabIndex={slim ? -1 : undefined} onClick={() => choose({ c: cat.slug, s: null })}>{cat.name}</button> : cat.name}</>}
        </p>
        {slim ? <p className="wb__title">{title}</p> : <h1 className="wb__title">{title}</h1>}
      </div>
      <div className="wb__wheels">
        <Wheel label="Category" items={catItems} value={sel.c ?? ALL} onChange={(k) => choose({ c: k === ALL ? null : k, s: null })} />
        {cat && <Wheel key={cat.slug} label={cat.name} items={colItems} value={sel.s ?? ALL} onChange={(k) => choose({ c: cat.slug, s: k === ALL ? null : k, t: sel.t })} />}
        {cat && hasVideo && <Wheel key={`${cat.slug}-type`} label="Type" items={kindItems} value={sel.t ?? ALL} onChange={(k) => choose({ c: cat.slug, s: sel.s, t: isKind(k) ? k : null })} />}
      </div>
    </>
  );

  return (
    <div className="wb" style={{ '--len': Math.max(4, title.length) } as React.CSSProperties}>
      <header className="wb__head" ref={head}>{bar(false)}</header>
      <div className={`wb__bar${stuck ? ' is-on' : ''}`} aria-hidden={!stuck} inert={!stuck}>{bar(true)}</div>

      {col && (
        <div className="wb__intro">
          {col.summary && <p className="wb__intro-text">{col.summary}</p>}
          {col.page && (
            <Link className="wb__intro-link mono" href={col.page} onClick={() => track(`Open project · ${col.name}`)}>
              About this project<span aria-hidden="true"> ↗</span>
            </Link>
          )}
        </div>
      )}

      {shots.length ? (
        <>
          {/* systems, tools and websites first: three across, bigger, each window on the page itself */}
          {wide.length > 0 && <div className="wb__grid wb__grid--wide">{wide.map(tile)}</div>}
          {rest.length > 0 && <div className={`wb__grid${wide.length ? ' wb__grid--after' : ''}`}>{rest.map(tile)}</div>}
        </>
      ) : (
        <p className="wb__empty lead">Coming soon.</p>
      )}

      {/* on <body>, above the site header (inside <main> it would sit under it: main's fade-in makes its own layer) */}
      {viewing !== null && createPortal(<PhotoCarousel shots={shots} start={viewing} onClose={closeViewer} />, document.body)}
    </div>
  );
}
