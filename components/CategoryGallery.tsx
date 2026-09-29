'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/track';
import PhotoCarousel from './ui/PhotoCarousel';

export type Shot = { src: string; alt: string; w: number; h: number; project: string; slug: string; n: number };
export type Group = { slug: string; name: string; shots: Shot[] };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A category's full page body: an index of its sub-categories on the left
 * (hover to pick them out, click to show only that one, kept in ?s=) and all
 * of its pictures on the right as an even grid of same-size tiles. Clicking
 * one opens the carousel over exactly the pictures on show (all, or one collection).
 */
export default function CategoryGallery({ category, groups }: { category: string; groups: Group[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const closeViewer = useCallback(() => setViewing(null), []);

  useEffect(() => {
    const sync = () => {
      const s = new URLSearchParams(window.location.search).get('s');
      setSel(groups.some((g) => g.slug === s && g.shots.length) ? s : null);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [groups]);

  const choose = useCallback((slug: string | null) => {
    setSel(slug);
    setHover(null);
    const name = groups.find((g) => g.slug === slug)?.name;
    track(name ? `Index · ${category} › ${name}` : `Index · ${category}`);
    window.history.pushState(null, '', `${window.location.pathname}${slug ? `?s=${slug}` : ''}`);
  }, [groups, category]);

  const placed = useMemo(() => groups
    .filter((g) => !sel || g.slug === sel)
    .flatMap((g) => g.shots.map((s) => ({ ...s, sub: g.slug }))), [groups, sel]);
  const total = groups.reduce((n, g) => n + g.shots.length, 0);

  return (
    <div className="cat">
      <nav className="cat-index" aria-label={`${category} index`}>
        <p className="cat-index__label mono">Index<sup>{pad(groups.length)}</sup></p>
        <ol onPointerLeave={() => setHover(null)}>
          <li>
            <button type="button" className={!sel ? 'is-active' : undefined} aria-pressed={!sel} onClick={() => choose(null)}>
              <span className="mono">00</span>All<small className="mono">{pad(total)}</small>
            </button>
          </li>
          {groups.map((g, i) => (
            <li key={g.slug}>
              <button
                type="button"
                className={sel === g.slug ? 'is-active' : undefined}
                aria-pressed={sel === g.slug}
                disabled={!g.shots.length}
                onClick={() => choose(sel === g.slug ? null : g.slug)}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !sel) setHover(g.slug); }}
                onFocus={() => { if (!sel) setHover(g.slug); }}
                onBlur={() => setHover(null)}
              >
                <span className="mono">{pad(i + 1)}</span>{g.name}<small className="mono">{g.shots.length ? pad(g.shots.length) : 'Soon'}</small>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="cat-grid" key={sel ?? 'all'} data-hover={hover ?? undefined}>
        {placed.map((p, i) => (
          <figure key={p.src} className={`cat-shot${hover && hover !== p.sub ? ' is-dim' : ''}`} style={{ '--i': i } as React.CSSProperties}>
            <button type="button" onClick={() => { setViewing(i); track(`View photo · ${p.project}`); }} aria-label={`View ${p.project}, photo ${p.n}: ${p.alt}`}>
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={i < 6 ? 'eager' : 'lazy'} />
            </button>
          </figure>
        ))}
      </div>

      {viewing !== null && <PhotoCarousel shots={placed} start={viewing} onClose={closeViewer} />}
    </div>
  );
}
