'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/track';

export type Shot = { src: string; alt: string; w: number; h: number; project: string; slug: string; n: number };
export type Group = { slug: string; name: string; shots: Shot[] };

const pad = (n: number) => String(n).padStart(2, '0');

/*
 * Rows on a 12-column grid, cycling through a few rhythms so sizes vary:
 * small-big-small, five small, big-and-three, six thumbnails, a wide centre.
 * Each row fills all 12 columns, so rows break cleanly; the last row takes a
 * shape that fits however many pictures are left.
 */
const RHYTHM = [[3, 6, 3], [2, 3, 2, 3, 2], [5, 2, 2, 3], [2, 2, 2, 2, 2, 2], [2, 7, 3]];
const TAIL: Record<number, number[]> = { 1: [6], 2: [5, 7], 3: [3, 6, 3], 4: [5, 2, 2, 3], 5: [2, 3, 2, 3, 2], 6: [2, 2, 2, 2, 2, 2] };

type Placed = Shot & { sub: string; span: number };

function arrange(items: (Shot & { sub: string })[]): Placed[] {
  const out: Placed[] = [];
  let i = 0, r = 0;
  while (i < items.length) {
    const left = items.length - i;
    let spans = RHYTHM[r++ % RHYTHM.length];
    if (spans.length > left) spans = TAIL[left];
    const row = items.slice(i, i + spans.length);
    const s = [...spans];
    // a landscape picture never gets a narrow slot: trade with the widest portrait one
    row.forEach((it, k) => {
      if (it.w / it.h > 1.15 && s[k] < 5) {
        const j = s.reduce((best, v, q) => (row[q].w / row[q].h <= 1.15 && v > s[best] ? q : best), k);
        if (j !== k) [s[k], s[j]] = [s[j], s[k]];
      }
    });
    row.forEach((it, k) => out.push({ ...it, span: s[k] }));
    i += spans.length;
  }
  return out;
}

/**
 * A category's full page body: an index of its sub-categories on the left
 * (hover to pick them out, click to show only that one, kept in ?s=) and all
 * of its pictures on the right in rows of mixed sizes.
 */
export default function CategoryGallery({ category, groups }: { category: string; groups: Group[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

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

  const placed = useMemo(() => arrange(
    groups.filter((g) => !sel || g.slug === sel).flatMap((g) => g.shots.map((s) => ({ ...s, sub: g.slug }))),
  ), [groups, sel]);
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
          <figure key={p.src} className={`cat-shot${p.span >= 5 ? ' is-wide' : ''}${hover && hover !== p.sub ? ' is-dim' : ''}`} style={{ '--span': p.span, '--i': i } as React.CSSProperties}>
            <Link href={`/work/${p.slug}#photo-${p.n}`} aria-label={`${p.project}, photo ${p.n}: ${p.alt}`}>
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={i < 6 ? 'eager' : 'lazy'} />
            </Link>
            <figcaption className="mono"><span>{p.project}</span><span>{pad(p.n)}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
