'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { nav, site } from '@/lib/content';

import Logo from './Logo';
import { Leaf, Loop, LOOPS } from './Art';

/** The pages in the menu; Contact has its own page. */
const LINKS = nav.map((n) => (n.label === 'Contact' ? { ...n, href: '/contact' } : n));

/** Is the page dark where (x, y) is? Reads the first coloured background under that point, skipping the header itself. */
function darkAt(x: number, y: number, header: HTMLElement | null) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (header?.contains(el) || el.tagName === 'IMG' || el.tagName === 'VIDEO') continue;
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/[\d.]+/g);
    if (!m || (m.length > 3 && Number(m[3]) < 0.5)) continue;
    // rgb() is 0-255; a mixed colour comes back as color(srgb 0-1 0-1 0-1 / alpha)
    const k = bg.startsWith('color(') ? 255 : 1;
    const [r, g, b] = m.slice(0, 3).map((v) => Number(v) * k);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
  }
  return false;
}

/**
 * Header, as on the first site and the same everywhere: the logo on the left and the menu lines on the right, always
 * there, never a bar. Scrolling down, the words SHIVO LABS fold away and the logo mark stays. The lines are one per
 * section of the page and the long one is the section you are in. Both turn light or dark with the page under them.
 * The pages are in a full-screen green menu that opens from the lines as a circle.
 */
export default function V2Header() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkL, setDarkL] = useState(false);
  const [darkR, setDarkR] = useState(false);
  const [count, setCount] = useState(3);
  const [at, setAt] = useState(0);
  const head = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    let frame = 0, until = 0;
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('main section'))
      .filter((el) => !el.parentElement?.closest('section'));
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      // the page under the logo and under the menu lines
      const h = head.current;
      const bar = h?.querySelector<HTMLElement>('.v2-header__logo')?.getBoundingClientRect();
      const lines = btn.current?.getBoundingClientRect();
      if (bar) setDarkL(darkAt(bar.left + 10, bar.top + bar.height / 2, h));
      if (lines) setDarkR(darkAt(lines.left + lines.width / 2, lines.top + lines.height / 2, h));
      // one line per section of the page (a page with one section: three lines that follow the scroll)
      const list = sections();
      if (list.length >= 2) {
        setCount(Math.min(list.length, 7));
        const mid = window.innerHeight * 0.45;
        let i = 0;
        list.forEach((el, k) => { if (el.getBoundingClientRect().top <= mid) i = k; });
        setAt(Math.min(i, 6));
      } else {
        setCount(3);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setAt(max > 0 ? Math.min(2, Math.floor((y / max) * 3)) : 0);
      }
      // the scenes' colours trail the scroll a moment (scrubbed), so keep looking until they have settled
      if (performance.now() < until) frame = requestAnimationFrame(update);
    };
    const onScroll = () => { until = performance.now() + 1600; if (!frame) frame = requestAnimationFrame(update); };
    update();
    // the page may still be settling (pinned scenes set their height on load)
    const settle = setTimeout(update, 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { clearTimeout(settle); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('v2-menu-open', open);
    if (open) lenis?.stop(); else lenis?.start();
    // the circle grows from the menu button
    const r = btn.current?.getBoundingClientRect();
    if (r) document.documentElement.style.setProperty('--v2-menu-o', `${r.left + r.width / 2}px ${r.top + r.height / 2}px`);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  // a new page closes the menu
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header ref={head} className={`v2-header${open ? ' is-open' : ''}${scrolled ? ' is-scrolled' : ''}`}>
        <Link className="v2-header__logo" href={'/'} aria-label="Shivo Labs — home">
          <Logo loader tone={darkL || open ? 'dark' : 'light'} />
        </Link>

        <button ref={btn} type="button" className={`v2-header__menu${darkR || open ? ' is-light' : ''}`} aria-expanded={open} aria-controls="v2-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">Menu</span>
          <span className="v2-header__lines" aria-hidden="true" style={{ '--n': count, '--gap': count > 5 ? '4px' : '5px' } as React.CSSProperties}>
            {Array.from({ length: count }, (_, i) => (
              <i key={i} className={i === at ? 'is-here' : undefined} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </span>
        </button>
      </header>

      <div id="v2-menu" className={`v2-menu${open ? ' is-open' : ''}`} inert={!open}>
        <div className="v2-petals" aria-hidden="true" />
        <Loop className="v2-menu__loop" d={LOOPS.long} color="var(--lime)" width={16} draw={false} />
        <Leaf className="v2-menu__leaf" />
        <nav className="v2-menu__list" aria-label="Menu">
          {LINKS.map((n, i) => (
            <Link key={n.href} href={n.href} style={{ '--i': i } as React.CSSProperties} onClick={() => setOpen(false)}>
              <span className="v2-menu__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="v2-menu__word">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="v2-menu__foot">
          <a className="v2-pill v2-pill--lime" href={`mailto:${site.email}`}>{site.email}</a>
          <a className="v2-pill" href={`https://wa.me/${site.phones[0].wa}`} target="_blank" rel="noopener">WhatsApp {site.phones[0].label}</a>
          <span className="v2-pill v2-pill--line">{site.location}</span>
        </div>
      </div>
    </>
  );
}
