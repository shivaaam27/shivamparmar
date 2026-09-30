'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

type Section = { id: string; label: string };
const pad = (n: number) => String(n).padStart(2, '0');

/** Distance from the top of the page, ignoring transforms. A pinned section is measured by its placeholder. */
function pageTop(el: HTMLElement) {
  let y = 0, n: HTMLElement | null = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  while (n) { y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return y;
}

/**
 * The About page frame: an index on the left and the content centred beside
 * it. The index turns like the picker wheels on the work page: every section
 * stays listed, the one you're reading is sharp, and the others fade, blur
 * and tilt away the further they are from it, rolling smoothly as you scroll.
 * Clicking a section jumps to it.
 */
export default function AboutShell({ sections, children, end }: { sections: Section[]; children: React.ReactNode; end?: React.ReactNode }) {
  const [active, setActive] = useState(sections[0]?.id);
  const list = useRef<HTMLOListElement>(null);
  const lenis = useLenis();

  // ---- the index follows the reading, continuously: p = 2.4 is on its way from section 3 to 4
  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const els = sections.map((s) => document.getElementById(s.id));
      if (els.some((e) => !e)) return;
      const tops = (els as HTMLElement[]).map(pageTop);
      const line = window.scrollY + window.innerHeight * 0.4;
      let p = 0;
      for (let i = 0; i < tops.length; i++) {
        if (line < tops[i]) break;
        const next = tops[i + 1];
        // hold on the section while it's being read; roll to the next one over the last quarter
        const f = next === undefined ? 0 : Math.min(1, (line - tops[i]) / (next - tops[i]));
        p = i + Math.max(0, (f - 0.75) / 0.25);
      }
      // at the very bottom the last section counts as read
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) p = tops.length - 1;
      const ol = list.current;
      if (ol) {
        ol.style.setProperty('--p', p.toFixed(3));
        Array.from(ol.children).forEach((li, i) => {
          const s = (li as HTMLElement).style;
          s.setProperty('--s', Math.max(-3, Math.min(3, i - p)).toFixed(3));
          s.setProperty('--d', Math.min(3, Math.abs(i - p)).toFixed(3));
        });
      }
      setActive(sections[Math.min(sections.length - 1, Math.round(p))]?.id);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [sections]);

  // on narrow screens the index is a sideways strip: keep the current section in view
  useEffect(() => {
    const ol = list.current;
    const nav = ol?.parentElement;
    const a = ol?.querySelector<HTMLElement>('[aria-current]');
    if (!nav || !a || window.innerWidth >= 1000) return;
    nav.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' });
  }, [active]);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // on narrow screens the index is a strip pinned under the header: clear it
    const side = document.querySelector<HTMLElement>('.ab-side');
    const offset = window.innerWidth < 1000 && side ? -(side.offsetHeight + 40) : -110;
    if (lenis) lenis.scrollTo(el, { offset }); else window.scrollTo({ top: pageTop(el) + offset, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  }, [lenis]);

  return (
    <>
      <div className="ab-stage">
        <div className="ab">
          <aside className="ab-side">
            <h1 className="ab-side__title">About</h1>
            <nav className="ab-side__nav" aria-label="About sections">
              <ol ref={list}>
                {sections.map((s, i) => (
                  <li key={s.id} style={{ '--s': Math.min(3, i), '--d': Math.min(3, i) } as React.CSSProperties}>
                    <a href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined}
                      onClick={(e) => { e.preventDefault(); go(s.id); }}>
                      <span className="mono">{pad(i + 1)}</span>{s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="ab-main">{children}</div>
        </div>
        {end}
      </div>
    </>
  );
}
