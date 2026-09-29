'use client';

import { useCallback, useEffect, useRef } from 'react';

export type WheelItem = { key: string; label: string; count?: number; disabled?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A short vertical list that scrolls like a picker wheel: the chosen item sits
 * in the middle in full ink, the ones around it fade and blur the further they
 * are. Click an item, or scroll the wheel and let it settle, to choose.
 */
export default function Wheel({ label, items, value, onChange }: {
  label: string; items: WheelItem[]; value: string; onChange: (key: string) => void;
}) {
  const list = useRef<HTMLOListElement>(null);
  const settle = useRef(0);
  const quiet = useRef(true);   // true while the wheel is being moved by code, not by hand

  // fade and blur by distance from the middle
  const paint = useCallback(() => {
    const el = list.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    for (const li of Array.from(el.children) as HTMLElement[]) {
      const d = Math.abs(li.offsetTop + li.offsetHeight / 2 - mid) / li.offsetHeight;
      li.style.setProperty('--d', String(Math.min(d, 3)));
    }
  }, []);

  const centre = useCallback((key: string, smooth: boolean) => {
    const el = list.current;
    const li = el?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
    if (!el || !li) return;
    quiet.current = true;
    el.scrollTo({ top: li.offsetTop + li.offsetHeight / 2 - el.clientHeight / 2, behavior: smooth ? 'smooth' : 'instant' });
    window.setTimeout(() => { quiet.current = false; }, smooth ? 500 : 50);
  }, []);

  // keep the chosen item in the middle (also when the wheel changes height)
  useEffect(() => {
    centre(value, false);
    paint();
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { centre(value, false); paint(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, items, centre, paint]);

  const onScroll = () => {
    paint();
    if (quiet.current) return;
    clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = list.current;
      if (!el) return;
      const mid = el.scrollTop + el.clientHeight / 2;
      let best: HTMLElement | null = null, dist = Infinity;
      for (const li of Array.from(el.children) as HTMLElement[]) {
        const d = Math.abs(li.offsetTop + li.offsetHeight / 2 - mid);
        if (d < dist) { dist = d; best = li; }
      }
      const key = best?.dataset.key;
      const item = items.find((i) => i.key === key);
      if (key && key !== value && item && !item.disabled) onChange(key);
      else centre(value, true);
    }, 220);
  };

  return (
    <div className="wheel">
      <p className="wheel__label mono">{label}</p>
      <ol className="wheel__list" ref={list} onScroll={onScroll} data-lenis-prevent aria-label={label}>
        {items.map((it) => (
          <li key={it.key} data-key={it.key}>
            <button type="button" aria-pressed={it.key === value} disabled={it.disabled}
              onClick={() => { if (it.key !== value) onChange(it.key); else centre(it.key, true); }}>
              {it.label}{it.count !== undefined && <span className="mono">{it.count ? pad(it.count) : 'Soon'}</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
