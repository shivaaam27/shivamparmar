'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Shot } from './CategoryGallery';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Full-screen viewer: the pictures side by side, moved through left and
 * right (arrows, ← / → keys, swipe, trackpad or mouse wheel). Esc or ✕ closes.
 * It shows exactly the set it was opened from: everything under "All", or
 * one collection when one is chosen.
 */
export default function PhotoViewer({ shots, start, onClose }: { shots: Shot[]; start: number; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(start);
  const shot = shots[at];

  const slide = (i: number) => track.current?.children[i] as HTMLElement | undefined;
  const go = useCallback((i: number, smooth = true) => {
    const el = track.current, s = slide(Math.max(0, Math.min(shots.length - 1, i)));
    if (!el || !s) return;
    el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.clientWidth) / 2, behavior: smooth ? 'smooth' : 'instant' });
  }, [shots.length]);

  // open on the picture that was clicked; keep the page behind still
  useEffect(() => {
    go(start, false);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = before; };
  }, [go, start]);

  // which picture is in the middle
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const s = c as HTMLElement;
      const d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    setAt(best);
  };

  // keys, and a vertical mouse wheel moves sideways
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at, go, onClose]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); el.scrollLeft += e.deltaY; }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label="Photos" data-lenis-prevent>
      <header className="viewer__bar mono">
        <span className="viewer__count" aria-live="polite">{pad(at + 1)} / {pad(shots.length)}</span>
        <Link className="viewer__project" href={`/work/${shot.slug}`}>{shot.project}<span aria-hidden="true"> ↗</span></Link>
        <button type="button" className="viewer__close" onClick={onClose} autoFocus>Close<span aria-hidden="true"> ✕</span></button>
      </header>

      <div className="viewer__track" ref={track} onScroll={onScroll}>
        {shots.map((s, i) => (
          <figure key={s.src} className={`viewer__slide${i === at ? ' is-on' : ''}`} onClick={() => i !== at && go(i)}>
            <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading={Math.abs(i - start) < 3 ? 'eager' : 'lazy'} />
          </figure>
        ))}
      </div>

      <div className="viewer__nav">
        <button type="button" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous photo">←</button>
        <button type="button" onClick={() => go(at + 1)} disabled={at === shots.length - 1} aria-label="Next photo">→</button>
      </div>
    </div>
  );
}
