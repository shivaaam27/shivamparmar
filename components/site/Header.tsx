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
 * there, on the bare page (no bar, no frosted back on a computer). The page links (About, Work, Journal, Contact) are
 * only in the menu. A button beside the lines switches between the dark and the light look. Scrolling down, the words SHIVO LABS fold away and the logo mark stays. The lines are one per
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const head = useRef<HTMLElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    let frame = 0, until = 0, probed = 0;
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('main section'))
      .filter((el) => !el.parentElement?.closest('section'));
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      // reading the colours and the sections under the header makes the browser lay the page out: about ten times a
      // second is plenty (the last read comes when the scroll has stopped), not on every frame of a phone's scroll
      const now = performance.now();
      if (now - probed < 100 && now < until) { frame = requestAnimationFrame(update); return; }
      probed = now;
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

  // the look now in use: the choice made with the button, else the device's
  useEffect(() => {
    const chosen = document.documentElement.dataset.theme;
    setTheme(chosen === 'light' || chosen === 'dark' ? chosen : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }, []);
  const switchTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('shivo-theme', next); } catch { /* storage off: the choice lasts until the page is closed */ }
    const root = document.documentElement;
    // the page changes look where it stands, at once (it used to reload, which showed the bare text and then the intro
    // again; a fade on every element was tried and made the switch lag): the bars take the new colour, and the scenes read
    // their colours again a frame later
    root.dataset.theme = next;
    setTheme(next);
    document.querySelectorAll('meta[name=theme-color]').forEach((m) => m.setAttribute('content', next === 'light' ? '#F5F5F2' : '#141517'));
    requestAnimationFrame(() => { window.dispatchEvent(new Event('v2-theme')); window.dispatchEvent(new Event('scroll')); });
  };

  return (
    <>
      <header ref={head} className={`v2-header${open ? ' is-open' : ''}${scrolled ? ' is-scrolled' : ''}`}>
        <div className="v2-header__start">
          <Link className="v2-header__logo" href={'/'} aria-label="Shivo Labs — home">
            <Logo loader tone={darkL || open ? 'dark' : 'light'} />
          </Link>
        </div>

        <div className="v2-header__end">
        <button type="button" className={`v2-header__theme${darkR || open ? ' is-light' : ''}`} onClick={switchTheme}
          aria-label={theme === 'light' ? 'Switch to the dark look' : 'Switch to the light look'} title={theme === 'light' ? 'Dark look' : 'Light look'}>
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></svg>
          )}
        </button>

        <button ref={btn} type="button" className={`v2-header__menu${darkR || open ? ' is-light' : ''}`} aria-expanded={open} aria-controls="v2-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">Menu</span>
          <span className="v2-header__lines" aria-hidden="true" style={{ '--n': count, '--gap': count > 5 ? '4px' : '5px' } as React.CSSProperties}>
            {Array.from({ length: count }, (_, i) => (
              <i key={i} className={i === at ? 'is-here' : undefined} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </span>
        </button>
        </div>
      </header>

      <div id="v2-menu" className={`v2-menu${open ? ' is-open' : ''}`} inert={!open}>
        <div className="v2-petals" aria-hidden="true" />
        <Loop className="v2-menu__loop" d={LOOPS.long} color="var(--lime)" width={16} draw={false} />
        <Leaf className="v2-menu__leaf" />
        <nav className="v2-menu__list" aria-label="Menu">
          {LINKS.map((n, i) => (
            // another page: the menu stays until that page is there (closing it at once showed the old page again
            // while the new one loaded); the same page (/#contact on the home page): it closes at once
            <Link key={n.href} href={n.href} style={{ '--i': i } as React.CSSProperties}
              onClick={() => { if (n.href.split('#')[0] === pathname) setOpen(false); }}>
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
