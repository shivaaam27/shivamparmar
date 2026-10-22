'use client';

import { useLayoutEffect, useRef, useState } from 'react';

export type TabItem = { key: string; label: string; count?: number; disabled?: boolean };

/**
 * Filter tabs: the choices sit in one soft track and a lime marker glides under the chosen one.
 * Counts are small figures beside each name. On narrow screens the track scrolls sideways and keeps
 * the chosen tab in view.
 */
export default function Tabs({ items, value, onChange, label, soft = false }: {
  items: TabItem[]; value: string; onChange: (key: string) => void; label: string; soft?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const place = () => {
      const b = el.querySelector<HTMLElement>(`[data-key="${CSS.escape(value)}"]`);
      if (!b) return setMark(null);
      setMark({ x: b.offsetLeft, w: b.offsetWidth });
      const left = b.offsetLeft - el.clientWidth / 2 + b.offsetWidth / 2;
      if (el.scrollWidth > el.clientWidth) el.scrollTo({ left, behavior: 'smooth' });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, items]);

  return (
    <div ref={track} className={`v2-tabs${soft ? ' v2-tabs--soft' : ''}`} role="group" aria-label={label}>
      {mark && <span className="v2-tabs__mark" style={{ transform: `translateX(${mark.x}px)`, width: mark.w }} aria-hidden="true" />}
      {items.map((it) => (
        <button key={it.key} data-key={it.key} type="button" className="v2-tabs__b" aria-pressed={it.key === value} disabled={it.disabled}
          onClick={() => onChange(it.key)}>
          {it.label}{it.count !== undefined && <sup>{it.count}</sup>}
        </button>
      ))}
    </div>
  );
}
