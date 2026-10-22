'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { tc } from '@/lib/v2';
import type { Product } from '@/lib/products';
import { Mark } from './Logo';
import { LOOP, THIN } from './Hero';

const HOLD = 4800; // ms each product stays before the next slides in

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The products page (docs/V2-PLAN.md, "Products"):
 *  1. deep green, the title and the loop line; scrolling, they leave and the paper rises over the green, while the
 *     logo, large and faint on the left all along, glides in and shrinks into place in the middle;
 *  2. under the logo the products then play on their own, one after another: each slides away to the right as the
 *     next comes in from the left, and the small word under the logo changes with it (HUB, AI, CHAT...). Arrows and
 *     the row of dots move it by hand; it rests while the pointer is over it. Scrolling only brings it in.
 */
export default function ProductsScene({ title, products }: { title: [string, string]; products: Product[] }) {
  const root = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [live, setLive] = useState(false);       // the logo has formed: the loop runs
  const [at, setAt] = useState(0);
  const [prev, setPrev] = useState(-1);           // the one sliding away
  const [dir, setDir] = useState(1);             // 1: the next comes in from the left; -1: from the right
  const [held, setHeld] = useState(false);
  const [tick, setTick] = useState(0);           // restarts the timer after a manual move
  const n = products.length;
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  const go = useCallback((to: number, d: number) => {
    const next = ((to % n) + n) % n;
    if (next === at) return;
    setDir(d); setPrev(at); setAt(next); setTick((t) => t + 1);
  }, [n, at]);

  // the loop: on its own, unless the pointer rests on it, the tab is hidden or motion is reduced
  useEffect(() => {
    if (!live || held || prefersReducedMotion()) return;
    const t = setTimeout(() => { if (!document.hidden) go(at + 1, 1); }, HOLD);
    return () => clearTimeout(t);
  }, [live, held, at, tick, go]);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); setLive(true); return; }
    const q = gsap.utils.selector(el);
    const mark = el.querySelector<SVGSVGElement>('.v2-ps__logo .v2-mark')!;
    const tiles = gsap.utils.toArray<SVGRectElement>('.v2-ps__logo rect', el);
    gsap.set(mark, { transformOrigin: '50% 50%', x: () => -window.innerWidth * .3, y: () => window.innerHeight * .28, scale: 6.5, autoAlpha: 0, '--tile': '#FFFFFF' });
    gsap.set(tiles, { transformOrigin: '50% 50%', x: (i) => -14 - (5 - i) * 9, y: (i) => (i % 2 ? 6 : -6) });
    gsap.set([q('.v2-ps__wm'), q('.v2-ps__subs'), q('.v2-ps__show')], { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - window.innerHeight}`, scrub: .8, invalidateOnRefresh: true,
        onUpdate: (s) => setLive(s.progress > .8),
      },
    });
    tl.to(q('.v2-ps__head'), { autoAlpha: 0, y: -60, duration: .8, ease: 'power2.in' })
      .to(q('.v2-ps__lines--green'), { autoAlpha: 0, duration: .7 }, '<.1')
      .to(mark, { autoAlpha: .22, x: () => -window.innerWidth * .24, y: () => window.innerHeight * .2, duration: 1, ease: 'power1.out' }, 0)
      .fromTo(q('.v2-ps__paper'), { clipPath: 'inset(100% 0% 0% 0% round 48px 48px 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0 0)', duration: .9 }, '>-.2')
      .fromTo(q('.v2-ps__lines--paper, .v2-ps__patch'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, '>-.2')
      .to(mark, { x: 0, y: 0, scale: 1, autoAlpha: 1, '--tile': '#141517', duration: 1.6, ease: 'power3.inOut' }, '<-.5')
      .to(tiles, { x: 0, y: 0, duration: 1.1, stagger: { each: .08, from: 'end' }, ease: 'power3.out' }, '<.4')
      .to(q('.v2-ps__wm'), { autoAlpha: 1, duration: .5 }, '>-.3')
      .to(q('.v2-ps__subs'), { autoAlpha: 1, duration: .4 }, '<.15')
      .fromTo(q('.v2-ps__show'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, '<.1')
      .to({}, { duration: .9 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  // swiping on a phone moves it too
  const touch = useRef<number | null>(null);

  return (
    <section ref={root} className={`v2-ps${drawn ? ' is-drawn' : ''}`} aria-labelledby="products-title">
      <div className="v2-ps__stick">
        <svg className="v2-hloop v2-ps__lines--green" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
        </svg>
        {/* the paper rises over the green */}
        <div className="v2-ps__paper" aria-hidden="true" />
        {/* on the paper: soft lines that keep moving behind the words */}
        <svg className="v2-ps__lines--paper" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d={LOOP} pathLength={1} />
          <path d={THIN} pathLength={1} />
          <path d="M-60 180C220 120 420 260 700 220s420-160 800-60" pathLength={1} />
        </svg>
        <div className="v2-ps__patch" aria-hidden="true" />
        <div className="v2-ps__head">
          <h1 id="products-title" className="v2-ps__title">{tc(title[0])} <em>{tc(title[1], { start: false })}</em></h1>
          <p className="v2-ps__hint">{n} products · scroll</p>
        </div>

        <div className="v2-ps__stage">
          <div className="v2-ps__logo" aria-hidden="true">
            <Mark />
            <span className="v2-ps__words">
              <span className="v2-ps__wm">SHIVO<span>LABS</span></span>
              <span className="v2-ps__subs">
                {products.map((p, i) => <span key={p.slug} className={`v2-ps__sub${i === at ? ' is-on' : ''}`}>{p.name}</span>)}
              </span>
            </span>
          </div>

          <div className="v2-ps__show" role="region" aria-roledescription="carousel" aria-label="Shivo Labs products"
            onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}
            onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => { const x0 = touch.current; touch.current = null; if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(at + (dx > 0 ? 1 : -1), dx > 0 ? 1 : -1); }}>
            <div className="v2-ps__slides" aria-live={held ? 'polite' : 'off'}>
              {products.map((p, i) => (
                <article key={p.slug} id={p.slug} className={`v2-ps__slide${i === at ? ' is-on' : i === prev ? ' is-out' : ''}`} style={{ '--dir': dir } as React.CSSProperties}
                  aria-hidden={i !== at} aria-roledescription="slide" aria-label={`${i + 1} of ${n}: Shivo Labs ${p.name}`}>
                  <h2 className="v2-ps__line">{tc(p.line)}</h2>
                  {i > 0 && <p className="v2-ps__text">{p.text}</p>}
                  <p className="v2-ps__on"><span>Works on</span>{p.on.join(' · ')}</p>
                </article>
              ))}
            </div>
            <div className="v2-ps__ctrl">
              <button type="button" className="v2-ps__arrow" onClick={() => go(at - 1, -1)} aria-label="Previous product"><Arrow flip /></button>
              <div className="v2-ps__dots">
                {products.map((p, i) => (
                  <button key={p.slug} type="button" className={`v2-ps__dot${i === at ? ' is-on' : ''}${held ? ' is-held' : ''}`} onClick={() => go(i, i >= at ? 1 : -1)}
                    aria-label={`Shivo Labs ${p.name}`} aria-current={i === at || undefined}>
                    {i === at && live && <i key={tick} style={{ animationDuration: `${HOLD}ms` }} />}
                  </button>
                ))}
              </div>
              <button type="button" className="v2-ps__arrow" onClick={() => go(at + 1, 1)} aria-label="Next product"><Arrow /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
