'use client';

import { useRef } from 'react';
import { PACE, growClip, gsap, onTouch, prefersReducedMotion, useGSAP } from '@/lib/motion';

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
    // the clip is written onto the panel itself, not as a custom property (lib/motion.ts, growClip)
    const open = { g: 0 };
    const paint = () => { panel.style.clipPath = growClip(open.g); };
    paint();
    gsap.to(open, { g: 1, ease: 'none', onUpdate: paint, scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: onTouch() ? .3 : PACE.scrub } });
  }, { scope: root });
  return <section ref={root} className={className} id={id} aria-label={label}>{children}</section>;
}
