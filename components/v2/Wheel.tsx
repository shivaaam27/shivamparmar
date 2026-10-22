'use client';

import { useCallback, useEffect, useRef } from 'react';

export type WheelItem = { key: string; label: string; count?: number; disabled?: boolean };

/**
 * V2's picker list (V1's wheel, in the new look): a small label, then a short vertical list. The chosen item is in
 * full ink with a leaf beside it; the others fade and soften the further they are from it. Longer lists scroll,
 * their edges fading where there's more, and the chosen one is kept in view. Clicking an item chooses it.
 */
export default function V2Wheel({ label, items, value, onChange, rows = 5 }: {
  label: string; items: WheelItem[]; value: string; onChange: (key: string) => void; rows?: number;
}) {
  const list = useRef<HTMLOListElement>(null);

  const paint = useCallback(() => {
    const el = list.current;
    if (!el) return;
    const lis = Array.from(el.children) as HTMLElement[];
    const at = Math.max(0, lis.findIndex((li) => li.dataset.key === value));
    lis.forEach((li, i) => li.style.setProperty('--d', String(Math.min(Math.abs(i - at), 3))));
    el.classList.toggle('is-scrolled', el.scrollTop > 2);
    el.classList.toggle('has-more', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, [value]);

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
    <div className="v2-wheel" style={{ '--rows': rows } as React.CSSProperties}>
      <p className="v2-wheel__label">{label}</p>
      <ol className="v2-wheel__list" ref={list} onScroll={paint} data-lenis-prevent aria-label={label}>
        {items.map((it) => (
          <li key={it.key} data-key={it.key}>
            <button type="button" aria-pressed={it.key === value} disabled={it.disabled}
              onClick={() => { if (it.key !== value) onChange(it.key); else reveal(it.key, true); }}>
              <i aria-hidden="true" />
              <span className="v2-wheel__name">{it.label}</span>
              {it.count !== undefined && <sup>{it.count || 'Soon'}</sup>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
