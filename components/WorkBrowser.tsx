'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { track } from '@/lib/track';
import Wheel, { type WheelItem } from './Wheel';
import PhotoCarousel from './ui/PhotoCarousel';

export type Shot = { src: string; alt: string; w: number; h: number; project: string; slug: string; n: number };
/** A collection (sub-category); `page` and `summary` come from its project. */
export type Collection = { slug: string; name: string; shots: Shot[]; page?: string; summary?: string };
export type Cat = { slug: string; name: string; collections: Collection[] };

type Sel = { c: string | null; s: string | null };
const ALL = '__all';

/** /work → all, /work/photography → a category, ?s=mikumi → one collection. */
function readSel(cats: Cat[]): Sel {
  const seg = window.location.pathname.replace(/\/+$/, '').split('/')[2] ?? null;
  const cat = cats.find((c) => c.slug === seg);
  const s = new URLSearchParams(window.location.search).get('s');
  return { c: cat?.slug ?? null, s: cat?.collections.some((x) => x.slug === s) ? s : null };
}
const pathOf = ({ c, s }: Sel) => `/work${c ? `/${c}` : ''}${c && s ? `?s=${s}` : ''}`;

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
    document.title = `${s?.name ?? c?.name ?? 'Work'} — Shivam Parmar`;

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
  const shots = useMemo(() => {
    const cs = cat ? [cat] : cats;
    return cs.flatMap((c) => c.collections.filter((x) => !col || x === col).flatMap((x) => x.shots));
  }, [cats, cat, col]);

  const count = (c: Cat) => c.collections.reduce((n, x) => n + x.shots.length, 0);
  const catItems: WheelItem[] = [
    { key: ALL, label: 'All', count: cats.reduce((n, c) => n + count(c), 0) },
    ...cats.map((c) => ({ key: c.slug, label: c.name, count: count(c) })),
  ];
  const colItems: WheelItem[] = cat ? [
    { key: ALL, label: 'All', count: count(cat) },
    ...cat.collections.map((x) => ({ key: x.slug, label: x.name, count: x.shots.length, disabled: !x.shots.length })),
  ] : [];

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
        {cat && <Wheel key={cat.slug} label={cat.name} items={colItems} value={sel.s ?? ALL} onChange={(k) => choose({ c: cat.slug, s: k === ALL ? null : k })} />}
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
        <div className="wb__grid">
          {shots.map((p, i) => (
            <figure key={p.src} className="wb__shot">
              <button type="button" onClick={() => { setViewing(i); track(`View photo · ${p.project}`); }} aria-label={`View ${p.project}, photo ${p.n}: ${p.alt}`}>
                <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={i < 10 ? 'eager' : 'lazy'} />
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <p className="wb__empty lead">Coming soon.</p>
      )}

      {viewing !== null && <PhotoCarousel shots={shots} start={viewing} onClose={closeViewer} />}
    </div>
  );
}
