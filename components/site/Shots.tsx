'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { srcSet } from '@/lib/thumb';

/**
 * A balanced masonry grid. Each picture goes into whichever column is shortest at that moment, so tall pictures
 * spread across the left, middle and right columns instead of piling up in one, and the columns end level.
 * Columns follow the grid's own width: 4 on a wide screen, 3 on a laptop or tablet, 2 on a phone.
 */
export function Masonry<T extends { w: number; h: number }>({ items, render, className = '' }: {
  items: T[]; render: (item: T, index: number) => React.ReactNode; className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);
  // measured before the first paint, so the grid never draws at the wrong count and then jumps (the page's height,
  // and a position returned to with back, would move under the reader)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = (w: number) => setCols(w >= 1080 ? 4 : w >= 640 ? 3 : 2);
    fit(el.clientWidth);
    const ro = new ResizeObserver(([e]) => fit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // a short set never spreads thinner than two pictures a column
  const n = Math.max(1, Math.min(cols, Math.ceil(items.length / 2)));
  const columns = useMemo(() => {
    const cols = n;
    const out: { item: T; i: number }[][] = Array.from({ length: cols }, () => []);
    const heights = new Array(cols).fill(0);
    items.forEach((item, i) => {
      // the shortest column; on a near tie, the one further left, so the order still reads left to right
      let at = 0;
      for (let c = 1; c < cols; c++) if (heights[c] < heights[at] - 0.02) at = c;
      out[at].push({ item, i });
      heights[at] += Math.min(item.h / item.w, TALL) + 0.06;
    });
    return out;
  }, [items, n]);

  return (
    <div ref={box} className={`v2-masonry ${className}`} style={{ '--cols': n } as React.CSSProperties}>
      {columns.map((col, c) => (
        <ul key={c} className="v2-masonry__col">
          {col.map(({ item, i }) => <li key={i}>{render(item, i)}</li>)}
        </ul>
      ))}
    </div>
  );
}

/** A very tall picture (a phone screen) is shown at most this tall in the grid, from its top; the viewer shows it whole. */
const TALL = 1.5;

export type TileShot = { src: string; alt: string; w: number; h: number; video?: string; project?: string; caption?: string };

/** One picture (or video) in the grid: rounded, lifts a little under the pointer; a video previews silently on hover. */
export function ShotTile({ shot, label, onOpen, eager = false }: { shot: TileShot; label?: string; onOpen: () => void; eager?: boolean }) {
  return (
    <button type="button" className={`v2-shot${shot.video ? ' is-video' : ''}${shot.h / shot.w > TALL ? ' is-tall' : ''}`} onClick={onOpen}
      aria-label={`View ${shot.video ? 'video' : 'photo'}: ${shot.alt}`}
      onPointerEnter={shot.video ? (e) => { if (e.pointerType === 'mouse') e.currentTarget.querySelector('video')?.play().catch(() => {}); } : undefined}
      onPointerLeave={shot.video ? (e) => { const v = e.currentTarget.querySelector('video'); if (v) { v.pause(); v.currentTime = 0; } } : undefined}>
      <img src={shot.src} srcSet={srcSet(shot.src, shot.w)} sizes="(max-width: 720px) 50vw, 25vw" alt={shot.alt} width={shot.w} height={shot.h} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      {shot.video && <video src={shot.video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
      {shot.video && <span className="v2-shot__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>}
      {label && <span className="v2-shot__name">{label}</span>}
    </button>
  );
}
