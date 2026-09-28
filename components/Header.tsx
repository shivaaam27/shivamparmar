'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { nav, site } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const lenis = useLenis();

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
        <a className="wordmark" href="#top" aria-label={`${site.name} — home`}>{site.name}</a>
        <button
          ref={btn}
          className="menu-btn"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <span className="menu-btn__lines" aria-hidden="true"><i /><i /><i /></span>
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
