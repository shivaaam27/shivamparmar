'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
 * The work page: a title bar that stays at the top while you scroll, with two
 * picker wheels beside the title (category, then its collections), and every
 * picture below edge to edge in same-size tiles. Choices live in the address,
 * so /work, /work/photography and /work/photography?s=mikumi all open here.
 * Clicking a picture opens the carousel over exactly the pictures on show.
 */
export default function WorkBrowser({ cats, initial }: { cats: Cat[]; initial: Sel }) {
  const [sel, setSel] = useState<Sel>(initial);
  const [viewing, setViewing] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const closeViewer = useCallback(() => setViewing(null), []);

  useEffect(() => {
    const sync = () => setSel(readSel(cats));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [cats]);

  // the bar tightens once it sticks to the top
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = useCallback((next: Sel) => {
    setSel(next);
    const c = cats.find((x) => x.slug === next.c);
    const s = c?.collections.find((x) => x.slug === next.s);
    track(c ? `Work · ${c.name}${s ? ` › ${s.name}` : ''}` : 'Work · All');
    window.history.pushState(null, '', pathOf(next));
    document.title = `${s?.name ?? c?.name ?? 'Work'} — Shivam Parmar`;
  }, [cats]);

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

  return (
    <div className="wb">
      <div ref={sentinel} className="wb__sentinel" aria-hidden="true" />
      <header className={`wb__bar${stuck ? ' is-stuck' : ''}`}>
        <div className="wb__titles">
          <p className="wb__crumb mono">
            {cat ? <button type="button" onClick={() => choose({ c: null, s: null })}>Work</button> : 'Selected'}
            {cat && <><span aria-hidden="true"> / </span>{col ? <button type="button" onClick={() => choose({ c: cat.slug, s: null })}>{cat.name}</button> : cat.name}</>}
          </p>
          <h1 className="wb__title">{col?.name ?? cat?.name ?? 'Work'}</h1>
        </div>
        <div className="wb__wheels">
          <Wheel label="Category" items={catItems} value={sel.c ?? ALL} onChange={(k) => choose({ c: k === ALL ? null : k, s: null })} />
          {cat && <Wheel key={cat.slug} label={cat.name} items={colItems} value={sel.s ?? ALL} onChange={(k) => choose({ c: cat.slug, s: k === ALL ? null : k })} />}
        </div>
      </header>

      {col && (
        <div className="wb__intro" key={col.slug}>
          {col.summary && <p className="wb__intro-text">{col.summary}</p>}
          {col.page && (
            <Link className="wb__intro-link mono" href={col.page} onClick={() => track(`Open project · ${col.name}`)}>
              About this project<span aria-hidden="true"> ↗</span>
            </Link>
          )}
        </div>
      )}

      {shots.length ? (
        <div className="wb__grid" key={`${sel.c}.${sel.s}`}>
          {shots.map((p, i) => (
            <figure key={p.src} className="wb__shot" style={{ '--i': i } as React.CSSProperties}>
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
