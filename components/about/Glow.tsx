'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';

/** Colour fields for the backdrop: deep foliage greens, warm brown, pale light. */
const PALETTE = ['#4b5e45', '#7f9270', '#6d5b46', '#c9d0bd', '#243029', '#a89782'];
/** Deep: dark green above, lit from below by moss and warm taupe. */
const DEEP = ['#6e8159', '#8f7a64', '#5a6d4d'];

type Tone = 'light' | 'deep';

/** A few blobs per box, placed differently for each seed so no two boxes match. */
function blobs(seed: number, tone: Tone) {
  const r = (n: number) => { const x = Math.sin(seed * 97.13 + n * 13.7) * 10000; return x - Math.floor(x); };
  const deep = tone === 'deep';
  const colours = deep ? DEEP : PALETTE;
  return Array.from({ length: deep ? 3 : 4 }, (_, i) => ({
    // deep: every card gets all three (moss, taupe, sage), in its own order
    c: colours[(deep ? seed + i : seed * 2 + i) % colours.length],
    x: Math.round(r(i) * (deep ? 80 : 100)),
    // deep: the light sits low, around the bottom edge
    y: deep ? 56 + Math.round(r(i + 9) * 26) : Math.round(r(i + 9) * 100),
    s: deep ? 60 + Math.round(r(i + 20) * 30) : 70 + Math.round(r(i + 20) * 60),
  }));
}

/**
 * A slowly moving gradient behind its content: blurred colour fields drift
 * on their own loops (GSAP), so the box always feels alive. Each box gets its
 * own arrangement from `seed`; `deep` keeps it dark and lit from below.
 * Still for anyone who prefers reduced motion.
 */
export default function Glow({ children, className = '', seed = 0, tone = 'light', as: Tag = 'div', style }: {
  children: React.ReactNode; className?: string; seed?: number; tone?: Tone; as?: 'div' | 'li'; style?: React.CSSProperties;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const deep = tone === 'deep';
    gsap.utils.toArray<HTMLElement>('.glow__blob', root.current).forEach((el, i) => {
      const drift = () => gsap.to(el, {
        // deep: sway sideways and breathe, but never climb far from the bottom
        xPercent: gsap.utils.random(deep ? -45 : -70, deep ? 5 : 20),
        yPercent: gsap.utils.random(deep ? -35 : -70, deep ? 0 : 20),
        scale: gsap.utils.random(0.8, deep ? 1.25 : 1.4),
        duration: gsap.utils.random(6, 11),
        ease: 'sine.inOut',
        onComplete: drift,
      });
      gsap.delayedCall(i * 0.3 + seed * 0.2, drift);
    });
  }, { scope: root });

  return (
    <Tag ref={root as never} className={`glow${tone === 'deep' ? ' glow--deep' : ''} ${className}`} style={style}>
      <span className="glow__field" aria-hidden="true">
        {blobs(seed, tone).map((b, i) => (
          <i key={i} className="glow__blob" style={{ background: b.c, left: `${b.x}%`, top: `${b.y}%`, width: `${b.s}%` }} />
        ))}
      </span>
      {children}
    </Tag>
  );
}
