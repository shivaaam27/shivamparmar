'use client';

import { useCallback, useEffect, useRef } from 'react';

export type WheelItem = { key: string; label: string; count?: number; disabled?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A short vertical list, starting right under its label: the chosen item in
 * full ink, the others fading and blurring the further they are from it.
 * When there are more items than fit, it scrolls; the chosen one is kept in
 * view. Scrolling only browses the list; clicking an item chooses it.
 */
export default function Wheel({ label, items, value, onChange }: {
  label: string; items: WheelItem[]; value: string; onChange: (key: string) => void;
}) {
  const list = useRef<HTMLOListElement>(null);

  // fade and blur by distance from the chosen item; fade the top edge once scrolled
  const paint = useCallback(() => {
    const el = list.current;
    if (!el) return;
    const lis = Array.from(el.children) as HTMLElement[];
    const at = Math.max(0, lis.findIndex((li) => li.dataset.key === value));
    lis.forEach((li, i) => li.style.setProperty('--d', String(Math.min(Math.abs(i - at), 3))));
    el.classList.toggle('is-scrolled', el.scrollTop > 2);
    el.classList.toggle('has-more', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, [value]);

  // bring the chosen item into view if it's below (or above) what shows
  const reveal = useCallback((key: string, smooth: boolean) => {
    const el = list.current;
    const li = el?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
    if (!el || !li) return;
    const top = li.offsetTop, bottom = top + li.offsetHeight;
    if (top >= el.scrollTop && bottom <= el.scrollTop + el.clientHeight) return;
    el.scrollTo({ top: top < el.scrollTop ? top : bottom - el.clientHeight, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    reveal(value, false);
    paint();
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { reveal(value, false); paint(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, items, reveal, paint]);

  return (
    <div className="wheel">
      <p className="wheel__label mono">{label}</p>
      <ol className="wheel__list" ref={list} onScroll={paint} data-lenis-prevent aria-label={label}>
        {items.map((it) => (
          <li key={it.key} data-key={it.key}>
            <button type="button" aria-pressed={it.key === value} disabled={it.disabled}
              onClick={() => { if (it.key !== value) onChange(it.key); else reveal(it.key, true); }}>
              {it.label}{it.count !== undefined && <span className="mono">{it.count ? pad(it.count) : 'Soon'}</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
