'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type FlipView = { id: string; label: string; content: React.ReactNode };

/**
 * A card that holds a few related views of one topic (devices, browsers,
 * systems…) and flips between them with its own ‹ › arrows, the view names
 * under the title, or a swipe. One card per topic, so nothing repeats.
 */
export default function Flip({ title, icon, views, aside, className = '', id }: {
  title: string; icon?: React.ReactNode; views: FlipView[]; aside?: React.ReactNode; className?: string; id?: string;
}) {
  const [at, setAt] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const n = views.length;
  const go = (i: number) => setAt((i + n) % n);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || (e.target as Element).closest('[data-noswipe]')) return;
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s || n < 2) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(at + (dx < 0 ? 1 : -1));
  };

  return (
    <article className={`card flip ${className}`} id={id} aria-roledescription="card">
      <header className="card__head">
        <h2 className="card__title">{icon && <span className="card__icon" aria-hidden="true">{icon}</span>}{title}</h2>
        <div className="card__tools">
          {aside}
          {n > 1 && (
            <div className="flip__arrows">
              <button type="button" onClick={() => go(at - 1)} aria-label={`Previous: ${views[(at - 1 + n) % n].label}`}><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => go(at + 1)} aria-label={`Next: ${views[(at + 1) % n].label}`}><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </header>
      {n > 1 && (
        <div className="flip__tabs" role="tablist" aria-label={title}>
          {views.map((v, i) => (
            <button key={v.id} type="button" role="tab" aria-selected={i === at} onClick={() => go(i)}>{v.label}</button>
          ))}
        </div>
      )}
      <div className="flip__body" onPointerDown={onDown} onPointerUp={onUp}>
        {views.map((v, i) => (
          <div key={v.id} role={n > 1 ? 'tabpanel' : undefined} aria-label={v.label} hidden={i !== at} className={i === at ? 'flip__view is-on' : 'flip__view'}>
            {v.content}
          </div>
        ))}
      </div>
    </article>
  );
}
