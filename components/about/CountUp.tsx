'use client';

import { useEffect, useRef, useState } from 'react';

/** A number that counts up from zero the first time it scrolls into view. */
export default function CountUp({ to, pad = 2, duration = 1400 }: { to: number; pad?: number; duration?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);   // the real number without JS, and for screen readers

  useEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
    let frame = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setN(Math.round(to * (1 - (1 - t) ** 3)));   // ease out
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [to, duration]);

  return <span ref={el} aria-label={String(to)}>{String(n).padStart(pad, '0')}</span>;
}
