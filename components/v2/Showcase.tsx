'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { v2 } from '@/lib/v2';
import { ArrowUR } from './Art';
import Ribbons from './Ribbons';
import { products, productsCopy } from '@/lib/products';
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

/** The logo's tiles, as in the app (shared/mark.js): tails first, the sage tip last. */
const TILES: [number, number, boolean][] = [[18, 64, false], [64, 18, false], [18, 41, false], [41, 18, false], [41, 41, false], [18, 18, true]];
const HOLD = 1.9;   // seconds each product name stays

/**
 * V2 copy of components/Showcase.tsx (own class names, V2 links), set on a deep green panel with moving lines.
 * Shivo Labs Hub & Products: a full screen after Work, on the page's own colour (white, or black in dark mode),
 * played like a short film the first time it is seen on each visit. The title arrives from both sides and meets
 * in the middle, lifts away, the logo builds tile by tile (as on the intro screen), and the products roll in
 * beside it one at a time, in a loop: Hub, AI, Chat and onwards. The logo and name always sit centred together,
 * gliding a little left or right as each name is longer or shorter. The name opens that product.
 * Everything is transforms and opacity, and the loop rests while the screen is somewhere else.
 */
export default function V2Showcase({ children }: { children?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const title = q('.v2-show__title')[0] as HTMLElement;
    const halves = q('.v2-show__half > span');
    const row = q('.v2-show__row')[0] as HTMLElement;
    const tiles = gsap.utils.toArray<SVGRectElement>('.v2-show__mark rect', el);
    const wm = q('.v2-show__wm > *');
    const names = q('.v2-show__name') as HTMLElement[];
    const slot = q('.v2-show__slot')[0] as HTMLAnchorElement;
    const button = q('.v2-show__all');
    const n = names.length;
    const stacked = () => window.matchMedia('(max-width: 720px)').matches;

    // How far to slide the row so the logo and the name showing make one centred group. All names share one
    // spot as wide as the longest; a shorter name leaves room on the right, so the row moves right by half of it.
    // With no name yet (k = -1) the logo alone is centred.
    const centreFor = (k: number) => {
      if (stacked()) return 0;
      const widths = names.map((nm) => nm.offsetWidth), widest = Math.max(...widths);
      if (k < 0) return (slot.offsetWidth + parseFloat(getComputedStyle(row).columnGap || '0')) / 2;
      return (widest - widths[k]) / 2;
    };

    let i = 0, next: gsap.core.Tween | undefined, onScreen = true, looping = false;
    const show = (k: number, instant = false) => {
      const chars = names[k].querySelectorAll('i');
      gsap.set(names[k], { autoAlpha: 1 });
      if (instant) {
        gsap.set(chars, { yPercent: 0, opacity: 1, filter: 'blur(0px)' });
        gsap.set(row, { x: centreFor(k) });
      } else {
        gsap.fromTo(chars, { yPercent: 110, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.035, ease: 'power3.out' });
        gsap.to(row, { x: centreFor(k), duration: 0.8, ease: 'power3.inOut', overwrite: 'auto' });
      }
      slot.href = `${v2('/products')}#${products[k].slug}`;
      slot.setAttribute('aria-label', `Shivo Labs ${products[k].name}: ${products[k].line}`);
    };
    const hide = (k: number) => {
      const chars = names[k].querySelectorAll('i');
      gsap.to(chars, { yPercent: -110, opacity: 0, filter: 'blur(6px)', duration: 0.45, stagger: 0.02, ease: 'power2.in', onComplete: () => { gsap.set(names[k], { autoAlpha: 0 }); } });
    };
    // the loop: hold, roll the current one out, roll the next one in; it rests while the screen is away
    const tick = () => {
      next = undefined;
      if (!onScreen) return;
      hide(i);
      i = (i + 1) % n;
      gsap.delayedCall(0.38, () => show(i));
      next = gsap.delayedCall(HOLD + 0.38, tick);
    };
    const startLoop = () => { looping = true; if (!next && onScreen) next = gsap.delayedCall(HOLD, tick); };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && looping && !next) next = gsap.delayedCall(0.6, tick);
    });
    io.observe(el);
    // a resize (or a phone turning) changes the widths: put the group back in the middle
    const recentre = () => { if (looping) gsap.set(row, { x: centreFor(i) }); };
    window.addEventListener('resize', recentre);

    // where everything rests (no film): the reduced-motion view, or arriving already below this screen
    const settle = () => {
      gsap.set([halves, tiles, wm, button, slot], { clearProps: 'all', autoAlpha: 1 });
      gsap.set(title, { clearProps: 'transform' });
      gsap.set(names, { autoAlpha: 0 });
      show(0, true);
    };
    const cleanup = () => { next?.kill(); io.disconnect(); window.removeEventListener('resize', recentre); };

    // hidden until the film starts
    gsap.set(halves, { autoAlpha: 0 });
    gsap.set(tiles, { opacity: 0 });
    gsap.set([wm, button, slot, ...names], { autoAlpha: 0 });

    if (prefersReducedMotion()) { settle(); return cleanup; }
    if (el.getBoundingClientRect().bottom < 0) { settle(); startLoop(); return cleanup; }

    const play = () => {
      // the title starts in the very middle of the screen, a little larger, then lifts to its place
      // the middle of the film's own half of the screen
      const box = (q('.v2-show__in')[0] as HTMLElement).getBoundingClientRect(), tb = title.getBoundingClientRect();
      const toMiddle = box.top + box.height / 2 - (tb.top + tb.height / 2);
      gsap.set(title, { y: toMiddle, scale: 1.18 });
      gsap.set(row, { x: centreFor(-1) });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // 1. from both sides, meeting in the middle
      tl.fromTo(halves[0], { xPercent: -38, autoAlpha: 0, filter: 'blur(10px)' }, { xPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.2 }, 0.1)
        .fromTo(halves[1], { xPercent: 38, autoAlpha: 0, filter: 'blur(10px)' }, { xPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.2 }, 0.1)
        // 2. it lifts away to the top
        .to(title, { y: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' }, 1.75)
        // 3. the logo builds, tails first, the sage tip last and flying in from the direction it points
        .addLabel('mark', 2.2);
      tiles.forEach((t, k) => {
        const lit = t.classList.contains('is-lit');
        tl.fromTo(t, lit ? { opacity: 0, x: -9, y: -9, scale: 0.5 } : { opacity: 0, y: 6, scale: 0.4 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: lit ? 0.75 : 0.5, ease: lit ? 'back.out(2.2)' : 'power3.out', transformOrigin: '50% 50%' }, `mark+=${k * 0.09}`);
      });
      tl.fromTo(wm, { autoAlpha: 0, y: 14, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12 }, 'mark+=0.55')
        // 4. the first product rolls in beside it, and the pair settles into the middle
        .to(slot, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 'mark+=1.45')
        .call(() => show(0), undefined, 'mark+=1.5')
        .fromTo(button, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 'mark+=2')
        .call(startLoop, undefined, 'mark+=2.1');
    };

    // once per visit: the first time this screen comes into view
    const st = ScrollTrigger.create({ trigger: el, start: 'top 55%', once: true, onEnter: play });
    return () => { st.kill(); cleanup(); };
  }, { scope: root });

  // the scene around the film: as it arrives the panel grows from a card to the full screen; further on the film
  // lifts away and the brands rise into the same place; then the page scrolls on
  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const panel = q('.v2-show__panel')[0] as HTMLElement;
    const hasBrands = q('.v2-show__brands').length > 0;
    gsap.set(panel, { '--g': 0 });
    gsap.fromTo(panel, { '--g': 0 }, { '--g': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: 0.5 } });
    if (!hasBrands) return;
    // the same screen turns cream and becomes the brands: the film lifts away, the moving lines and glow fade,
    // the headline settles from large to its place and the logos fly into a grid
    const tiles = q('.v2-bs__grid li') as HTMLElement[];
    gsap.set(q('.v2-show__brands'), { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
    tl.to({}, { duration: 2.6 })
      .to(q('.v2-show__in'), { autoAlpha: 0, y: -90, scale: .96, duration: 1.4, ease: 'power1.in' })
      .to(panel, { backgroundColor: '#F4F1E6', duration: 1.6, ease: 'power1.inOut' }, '<.4')
      .to(q('.v2-show__lines, .v2-show__glow'), { autoAlpha: 0, duration: 1.2 }, '<')
      .set(q('.v2-show__brands'), { autoAlpha: 1 }, '<.6')
      .fromTo(q('.v2-bs__title'), { autoAlpha: 0, y: '20vh', scale: 1.35 }, { autoAlpha: 1, y: 0, scale: 1, duration: 2, ease: 'power2.inOut' }, '<')
      .fromTo(tiles, {
        autoAlpha: 0, scale: .5,
        x: (i) => ((i % 7) - 3) * 40, y: (i) => (i < 7 ? -1 : 1) * 90 + ((i * 37) % 60) - 30,
        rotate: (i) => ((i * 53) % 24) - 12,
      }, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotate: 0, duration: 2.2, stagger: { each: .1, from: 'random' }, ease: 'power3.out' }, '<1')
      .fromTo(q('.v2-bs__grid'), { scale: 1.08 }, { scale: 1, duration: 2.6 }, '<')
      .to({}, { duration: 1 });
  }, { scope: root });

  return (
    <section ref={root} className="v2-show" id="products" aria-label={`${productsCopy.title.join(' ')}`}>
      <div className="v2-show__stick">
      <div className="v2-dark v2-show__panel">
      <Ribbons set="page" className="v2-show__lines" />
      <div className="v2-show__glow" aria-hidden="true" />
      <div className="v2-show__in">
        <h2 className="v2-show__title">
          <span className="v2-show__half v2-show__half--l"><span>{productsCopy.title[0]}</span></span>
          <span className="v2-show__half v2-show__half--r"><span>{productsCopy.title[1]}</span></span>
        </h2>

        <div className="v2-show__stage">
          <div className="v2-show__row">
            <svg className="v2-show__mark" viewBox="0 0 100 100" aria-hidden="true">
              <g transform="rotate(15 50 50)">
                {TILES.map(([x, y, lit], k) => <rect key={k} className={lit ? 'is-lit' : undefined} x={x} y={y} width="18" height="18" rx="4.5" />)}
              </g>
            </svg>
            <span className="v2-show__wm" aria-hidden="true"><b>SHIVO</b><span>LABS</span></span>
            <a className="v2-show__slot" href={`${v2('/products')}#${products[0].slug}`}>
              {products.map((p) => (
                <span key={p.slug} className="v2-show__name" aria-hidden="true">
                  {[...p.name.toUpperCase()].map((c, k) => <i key={k}>{c === ' ' ? ' ' : c}</i>)}
                </span>
              ))}
            </a>
          </div>
          <Link className="v2-btn v2-btn--lime v2-show__all" href={v2(productsCopy.link.href)}>
            {productsCopy.link.label}<span className="v2-btn__dot"><ArrowUR /></span>
          </Link>
        </div>

        {/* the same products for screen readers and search, without the film */}
        <ul className="sr-only">
          {products.map((p) => <li key={p.slug}><Link href={`${v2('/products')}#${p.slug}`}>Shivo Labs {p.name}: {p.line}</Link></li>)}
        </ul>
      </div>
      {/* the lower half: the brands, on the same panel */}
      {children && <div className="v2-show__brands">{children}</div>}
      </div>
      </div>
    </section>
  );
}
