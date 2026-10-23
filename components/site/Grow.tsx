'use client';

import { useRef } from 'react';
import { PACE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

/**
 * A block that arrives as a rounded card with a margin each side and grows to the full width as you scroll it into
 * view (the same move as the cream page on the home page). It sets --g from 0 to 1 on its first child; the look is in CSS.
 */
export default function Grow({ className = '', children, id, label }: { className?: string; children: React.ReactNode; id?: string; label?: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) return;
    const panel = el.firstElementChild as HTMLElement;
    gsap.fromTo(panel, { '--g': 0 }, { '--g': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: PACE.scrub } });
  }, { scope: root });
  return <section ref={root} className={className} id={id} aria-label={label}>{children}</section>;
}
