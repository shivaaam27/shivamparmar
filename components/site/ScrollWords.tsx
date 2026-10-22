'use client';

import { useRef } from 'react';
import { PACE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';

/**
 * A paragraph that fills in as you read: every word starts pale and turns to full ink, one after another,
 * as the paragraph moves up the screen. Marked phrases get a lime marker once filled.
 * The full text is there for screen readers and search from the start. `controlled`: a parent timeline fills them instead.
 */
export default function ScrollWords({ parts, className = '', dropCap = false, controlled = false }: { parts: { t: string; hl?: boolean }[]; className?: string; dropCap?: boolean; controlled?: boolean }) {
  const root = useRef<HTMLParagraphElement>(null);
  const text = parts.map((p) => p.t).join('');

  useGSAP(() => {
    const el = root.current!;
    const words = gsap.utils.toArray<HTMLElement>('.v2-sw__w', el);
    const marks = gsap.utils.toArray<HTMLElement>('.v2-sw__hl', el);
    if (prefersReducedMotion()) { marks.forEach((m) => m.classList.add('is-on')); return; }
    // inside the opening scene the scene's own timeline fills the words
    if (controlled) return;
    gsap.set(words, { opacity: 0.16 });
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.08,
      scrollTrigger: {
        trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: PACE.scrub,
        onUpdate: (st) => marks.forEach((m) => {
          const at = Number(m.dataset.at) / words.length;
          m.classList.toggle('is-on', st.progress > at);
        }),
      },
    });
  }, { scope: root });

  let n = 0;
  return (
    <p ref={root} className={`v2-sw ${className}`} aria-label={text}>
      {parts.map((p, i) => {
        const ws = p.t.split(/(\s+)/);
        const spans = ws.map((w, k) => {
          if (/^\s+$/.test(w) || !w) return w;
          // a drop cap: the very first letter, set large, two lines deep
          if (dropCap && i === 0 && k === 0) return <span key={k} aria-hidden="true"><span className="v2-sw__cap">{w[0]}</span><span className="v2-sw__w">{w.slice(1)}</span></span>;
          return <span key={k} className="v2-sw__w" aria-hidden="true">{w}</span>;
        });
        const at = n;
        n += ws.filter((w) => w && !/^\s+$/.test(w)).length;
        return p.hl ? <mark key={i} className="v2-sw__hl" data-at={at + 2}>{spans}</mark> : <span key={i}>{spans}</span>;
      })}
    </p>
  );
}
