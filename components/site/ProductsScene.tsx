'use client';

import { useEffect, useRef, useState } from 'react';
import { PACE, fitScene, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import type { Product } from '@/lib/products';
import { LOOP, THIN } from './Hero';

/**
 * The products, on the About page (docs/SITE.md, "Products"): one held green screen. "Shivo Labs" stays on top; the
 * word under it starts as PRODUCTS and, as you scroll, turns into each product's name in turn (each rises in as the
 * last rises away), with what it does and where it runs beneath. The same words are a plain list for screen readers,
 * search and "reduce motion".
 */
export default function ProductsScene({ products, id }: { products: Product[]; id?: string }) {
  const root = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const words = q('.v2-pn__word') as HTMLElement[];   // PRODUCTS, then one per product
    const infos = q('.v2-pn__info') as HTMLElement[];   // one per product
    gsap.set(words.slice(1), { yPercent: 100, autoAlpha: 0 });
    gsap.set(infos, { y: 30, autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: PACE.scrub, invalidateOnRefresh: true } });
    tl.to({}, { duration: .6 });
    words.slice(1).forEach((w, i) => {
      const at = .6 + i * 1.4;
      // the old name rises away first, then the new one rises in: never two at once
      tl.to(words[i], { yPercent: -100, autoAlpha: 0, duration: .45, ease: 'power2.in' }, at)
        .to(w, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'power3.out' }, at + .5);
      if (i > 0) tl.to(infos[i - 1], { y: -30, autoAlpha: 0, duration: .45, ease: 'power2.in' }, at);
      tl.to(infos[i], { y: 0, autoAlpha: 1, duration: .6, ease: 'power3.out' }, at + .55);
    });
    tl.to({}, { duration: .8 });
    fitScene(el, tl, 1);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} id={id} className={`v2-pn v2-dark${drawn ? ' is-drawn' : ''}`} aria-labelledby="products-title">
      <div className="v2-pn__stick">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-pn__in">
          <h2 id="products-title" className="v2-pn__title">
            <span className="v2-pn__top">Shivo Labs</span>
            <span className="v2-pn__words" aria-hidden="true">
              <span className="v2-pn__word" style={{ '--len': 8 } as React.CSSProperties}>Products</span>
              {products.map((p) => <span key={p.slug} className="v2-pn__word" style={{ '--len': Math.max(8, p.name.length) } as React.CSSProperties}>{p.name}</span>)}
            </span>
            <span className="sr-only"> Products</span>
          </h2>
          <ul className="v2-pn__infos">
            {products.map((p) => (
              <li key={p.slug} id={p.slug} className="v2-pn__info">
                <span className="sr-only">Shivo Labs {p.name}: </span>
                <p className="v2-pn__line">{p.line}</p>
                <p className="v2-pn__text">{p.text}</p>
                <p className="v2-pn__on"><span>Works on</span>{p.on.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
