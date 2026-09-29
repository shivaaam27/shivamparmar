'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';

type Section = { id: string; label: string };
const pad = (n: number) => String(n).padStart(2, '0');

/** Distance from the top of the page, ignoring transforms. */
function pageTop(el: HTMLElement) {
  let y = 0, n: HTMLElement | null = el;
  while (n) { y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return y;
}

/**
 * The About page frame: an index on the left that follows the reading and
 * jumps to a section, and the content centred beside it.
 */
export default function AboutShell({ sections, children, end }: { sections: Section[]; children: React.ReactNode; end?: React.ReactNode }) {
  const [active, setActive] = useState(sections[0]?.id);
  const lenis = useLenis();

  // ---- the index follows the reading
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      if (window.scrollY < 40) { setActive(sections[0]?.id); return; }
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // on narrow screens the index is a strip pinned under the header: clear it
    const side = document.querySelector<HTMLElement>('.ab-side');
    const offset = window.innerWidth < 1000 && side ? -(side.offsetHeight + 40) : -110;
    if (lenis) lenis.scrollTo(el, { offset }); else window.scrollTo({ top: pageTop(el) + offset, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    setActive(id);
  }, [lenis]);

  return (
    <>
      <div className="ab-stage">
        <div className="ab">
          <aside className="ab-side">
            <h1 className="ab-side__title">About</h1>
            <nav className="ab-side__nav" aria-label="About sections">
              <ol>
                {sections.map((s, i) => (
                  <li key={s.id}>
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
