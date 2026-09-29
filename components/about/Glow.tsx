'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';

/** Colour fields for the backdrop: deep foliage greens, warm brown, pale light. */
const PALETTE = ['#4b5e45', '#7f9270', '#6d5b46', '#c9d0bd', '#243029', '#a89782'];

/** A few blobs per box, placed differently for each seed so no two boxes match. */
function blobs(seed: number) {
  const r = (n: number) => { const x = Math.sin(seed * 97.13 + n * 13.7) * 10000; return x - Math.floor(x); };
  return Array.from({ length: 4 }, (_, i) => ({
    c: PALETTE[(seed * 2 + i) % PALETTE.length],
    x: Math.round(r(i) * 100), y: Math.round(r(i + 9) * 100), s: 70 + Math.round(r(i + 20) * 60),
  }));
}

/**
 * A slowly moving gradient behind its content: blurred colour fields drift
 * on their own loops (GSAP), so the box always feels alive. Each box gets its
 * own arrangement from `seed`. Still for anyone who prefers reduced motion.
 */
export default function Glow({ children, className = '', seed = 0, as: Tag = 'div' }: {
  children: React.ReactNode; className?: string; seed?: number; as?: 'div' | 'li';
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>('.glow__blob', root.current).forEach((el, i) => {
      const drift = () => gsap.to(el, {
        xPercent: gsap.utils.random(-70, 20),
        yPercent: gsap.utils.random(-70, 20),
        scale: gsap.utils.random(0.8, 1.4),
        duration: gsap.utils.random(6, 11),
        ease: 'sine.inOut',
        onComplete: drift,
      });
      gsap.delayedCall(i * 0.3 + seed * 0.2, drift);
    });
  }, { scope: root });

  return (
    <Tag ref={root as never} className={`glow ${className}`}>
      <span className="glow__field" aria-hidden="true">
        {blobs(seed).map((b, i) => (
          <i key={i} className="glow__blob" style={{ background: b.c, left: `${b.x}%`, top: `${b.y}%`, width: `${b.s}%` }} />
        ))}
      </span>
      {children}
    </Tag>
  );
}
