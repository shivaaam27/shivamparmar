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
      // the last section that has reached the middle, so gaps between sections (About) don't make it jump
      let i = 0;
      sections().forEach((el, k) => { if (el.getBoundingClientRect().top <= mid) i = k; });
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
        <a className="wordmark" href="/#top" aria-label="Fabra Labs — home">
          <svg className="wordmark__mark" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="0" y="0" width="18" height="18" rx="4.5" /><rect x="23" y="0" width="18" height="18" rx="4.5" />
            <rect className="is-lit" x="46" y="0" width="18" height="18" rx="4.5" />
            <rect x="0" y="23" width="18" height="18" rx="4.5" /><rect x="23" y="23" width="18" height="18" rx="4.5" />
            <rect x="0" y="46" width="18" height="18" rx="4.5" />
          </svg>
          <span className="wordmark__text">fabra<span>labs</span></span>
        </a>
        <button
          ref={btn}
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <span className="menu-btn__lines" aria-hidden="true" style={{ '--n': count, '--gap': count > 5 ? '4px' : '5px' } as React.CSSProperties}>
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
