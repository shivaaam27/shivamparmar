'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { nav, site } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const lenis = useLenis();
  // one line per section of the page; the long one is the section you're in
  const [count, setCount] = useState(3);
  const [at, setAt] = useState(0);
  useEffect(() => {
    // the page's top-level sections (a pinned section may sit inside a wrapper, so not just main > section)
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('main section'))
      .filter((el) => !el.parentElement?.closest('section'));
    const n = sections().length;
    if (n < 2) return;
    setCount(Math.min(n, 7));
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.45;
      const list = sections();
      let i = list.findIndex((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
      if (i < 0) i = list[0].getBoundingClientRect().top > mid ? 0 : list.length - 1;
      // the footer belongs to the last section
      setAt(Math.min(i, 6));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (open) lenis?.stop(); else lenis?.start();
    if (open) firstLink.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) { setOpen(false); btn.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="/#top" aria-label={`${site.name} — home`}>{site.name}</a>
        <button
          ref={btn}
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <span className="menu-btn__lines" aria-hidden="true" style={{ '--n': count } as React.CSSProperties}>
            {Array.from({ length: count }, (_, i) => (
              <i key={i} className={i === at ? 'is-here' : undefined} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </span>
        </button>
      </header>

      <nav className={`menu${open ? ' is-open' : ''}`} id="menu" aria-label="Main" inert={!open}>
        <ol className="menu__list">
          {nav.map((item, i) => (
            <li key={item.href}>
              <a ref={i === 0 ? firstLink : undefined} href={item.href} onClick={() => { lenis?.start(); setOpen(false); }}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="menu__foot mono">Lorem ipsum — dolor sit amet</p>
      </nav>
    </>
  );
}
