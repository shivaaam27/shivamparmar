'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { nav, site } from '@/lib/content';
import { v2 } from '@/lib/v2';
import Logo from './Logo';
import { ArrowUR, Leaf, Loop, LOOPS } from './Art';

/** The pages in the pill bar (Home is the logo, Contact is the button). */
const BAR = nav.filter((n) => n.label !== 'Home' && n.label !== 'Contact');

/**
 * V2 header: the logo in its own pill on the left, the pages in a pill in the middle, and a lime
 * "Start a project" button. It steps out of the way while you scroll down and comes back when you scroll up.
 * On phones and tablets the pages move into a full-screen green menu that opens from the button as a circle.
 */
export default function V2Header() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  // hide while scrolling down, show again on the way up (and always near the top)
  useEffect(() => {
    let last = window.scrollY, frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 160);
      setScrolled(y > 40);
      last = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

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

  const here = (href: string) => pathname === v2(href) || pathname.startsWith(`${v2(href)}/`);

  // the marker under the nav: on the hovered link, else on the current page
  const navRef = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [mark, setMark] = useState<{ x: number; w: number } | null>(null);
  const target = hover ?? BAR.find((n) => here(n.href))?.href ?? null;
  useEffect(() => {
    const nav = navRef.current;
    const a = target ? nav?.querySelector<HTMLElement>(`[data-href="${CSS.escape(target)}"]`) : null;
    setMark(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
  }, [target]);

  return (
    <>
      <header className={`v2-header${hidden && !open ? ' is-hidden' : ''}${open ? ' is-open' : ''}${scrolled ? ' is-scrolled' : ''}`}>
        <div className="v2-header__bar">
          <Link className="v2-header__logo" href={v2('/')} aria-label="Shivo Labs — home">
            <Logo loader />
          </Link>

          {/* a soft marker glides to the link under the pointer, and rests on the page you are on */}
          <nav ref={navRef} className="v2-header__nav" aria-label="Main" onPointerLeave={() => setHover(null)}>
            {mark && <span className="v2-header__mark" style={{ transform: `translateX(${mark.x}px)`, width: mark.w }} aria-hidden="true" />}
            {BAR.map((n) => (
              <Link key={n.href} href={v2(n.href)} data-href={n.href} className={here(n.href) ? 'is-here' : undefined} aria-current={here(n.href) ? 'page' : undefined}
                onPointerEnter={() => setHover(n.href)} onFocus={() => setHover(n.href)} onBlur={() => setHover(null)}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="v2-header__end">
            <a className="v2-btn v2-btn--small v2-header__cta" href={`${v2('/')}#contact`}>
              Start a project<span className="v2-btn__dot"><ArrowUR /></span>
            </a>
            <button ref={btn} type="button" className="v2-header__menu" aria-expanded={open} aria-controls="v2-menu" onClick={() => setOpen((o) => !o)}>
              <span className="sr-only">Menu</span>
              <i aria-hidden="true" /><i aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div id="v2-menu" className={`v2-menu${open ? ' is-open' : ''}`} inert={!open}>
        <div className="v2-petals" aria-hidden="true" />
        <Loop className="v2-menu__loop" d={LOOPS.long} color="var(--lime)" width={16} draw={false} />
        <Leaf className="v2-menu__leaf" />
        <nav className="v2-menu__list" aria-label="Menu">
          {nav.map((n, i) => (
            <Link key={n.href} href={v2(n.href)} style={{ '--i': i } as React.CSSProperties} onClick={() => setOpen(false)}>
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
