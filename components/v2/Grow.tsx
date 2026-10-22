'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';

/**
 * A screen that arrives as a rounded card and grows to fill the whole screen as you scroll it into view
 * (the same move as the products scene). It sets --g from 0 to 1 on its first child; the look is in CSS.
 */
export default function Grow({ className = '', children, id, label }: { className?: string; children: React.ReactNode; id?: string; label?: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) return;
    const panel = el.firstElementChild as HTMLElement;
    gsap.fromTo(panel, { '--g': 0 }, { '--g': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: 0.5 } });
  }, { scope: root });
  return <section ref={root} className={className} id={id} aria-label={label}>{children}</section>;
}
