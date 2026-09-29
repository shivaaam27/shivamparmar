'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';

/** Soft blurred colour fields: a deep, foliage-like backdrop for the number cards. */
const BLOBS = [
  { c: '#4b5e45', x: 10, y: 35, s: 78 },   // leaf green
  { c: '#7f9270', x: 45, y: 10, s: 60 },   // light green
  { c: '#6d5b46', x: 82, y: 22, s: 58 },   // warm brown
  { c: '#c9d0bd', x: 64, y: 92, s: 44 },   // pale light
  { c: '#243029', x: 32, y: 84, s: 70 },   // deep green
  { c: '#a89782', x: 96, y: 74, s: 42 },   // sand
];

/**
 * A slowly moving gradient behind whatever it wraps: blurred colour fields
 * drift on their own loops (GSAP), so the panel always feels alive.
 * Still for anyone who prefers reduced motion.
 */
export default function Glow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>('.glow__blob', root.current).forEach((el, i) => {
      const drift = () => gsap.to(el, {
        xPercent: gsap.utils.random(-45, 45),
        yPercent: gsap.utils.random(-40, 40),
        scale: gsap.utils.random(0.8, 1.35),
        duration: gsap.utils.random(7, 12),
        ease: 'sine.inOut',
        onComplete: drift,
      });
      gsap.delayedCall(i * 0.4, drift);
    });
  }, { scope: root });

  return (
    <div ref={root} className={`glow ${className}`}>
      <div className="glow__field" aria-hidden="true">
        {BLOBS.map((b, i) => (
          <i key={i} className="glow__blob" style={{ background: b.c, left: `${b.x}%`, top: `${b.y}%`, width: `${b.s}%` }} />
        ))}
      </div>
      <div className="glow__content">{children}</div>
    </div>
  );
}
