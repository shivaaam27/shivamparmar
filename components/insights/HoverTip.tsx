'use client';

import { useRef, useState } from 'react';

/**
 * One small tooltip for any child marked with data-tip (map countries).
 * The same values are always listed beside the map, so nothing depends on hovering.
 */
export default function HoverTip({ children, className }: { children: React.ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const move = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest('[data-tip]');
    if (!el || !box.current) return setTip(null);
    const r = box.current.getBoundingClientRect();
    setTip({ text: el.getAttribute('data-tip') ?? '', x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <div ref={box} className={`hovertip ${className ?? ''}`} onPointerMove={move} onPointerLeave={() => setTip(null)}>
      {children}
      {tip && <div className="hovertip__box" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
    </div>
  );
}
