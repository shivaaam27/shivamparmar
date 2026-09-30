'use client';

import { useEffect, useRef } from 'react';

/**
 * Marks its element `data-state="in"` the first time it scrolls into view, so
 * CSS can play the entrance (rising cards, rolling digits, drawing rings).
 * Rendered finished on the server, so without JS, or with reduced motion,
 * everything simply shows; with JS it resets to the start until it is seen.
 */
export default function Reveal({ children, className = '', as: Tag = 'div', threshold = 0.35, ...rest }: {
  children: React.ReactNode; className?: string; as?: 'div' | 'ul' | 'ol' | 'section'; threshold?: number;
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = el.getBoundingClientRect();
    // already on screen at load: play straight away
    if (box.top < window.innerHeight * (1 - threshold * 0.5) && box.bottom > 0) {
      el.dataset.state = 'wait';
      requestAnimationFrame(() => requestAnimationFrame(() => { el.dataset.state = 'in'; }));
      return;
    }
    el.dataset.state = 'wait';
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.dataset.state = 'in';
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return <Tag ref={ref as never} className={className} {...rest}>{children}</Tag>;
}
