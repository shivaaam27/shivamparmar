'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { nav, site } from '@/lib/content';

export default function Header() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const lenis = useLenis();
  const lines = useRef<HTMLSpanElement>(null);

  // the menu lines follow the scroll: a bump runs down the three lines as the
  // page moves (like a proximity minimap), then they settle back when it stops
  useEffect(() => {
    const el = lines.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bars = Array.from(el.children) as HTMLElement[];
    let idle = 0, frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      // three passes of the bump over the page, so it keeps moving while you read
      const pos = ((p * 3) % 1) * (bars.length + 1) - 1;
      bars.forEach((b, i) => {
        const near = Math.max(0, 1 - Math.abs(i - pos) / 1.1);
        b.style.setProperty('--w', `${12 + 18 * near}px`);
      });
      el.classList.add('is-scrolling');
      clearTimeout(idle);
      idle = window.setTimeout(() => el.classList.remove('is-scrolling'), 450);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); clearTimeout(idle); };
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
          <span className="menu-btn__lines" ref={lines} aria-hidden="true"><i /><i /><i /></span>
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
