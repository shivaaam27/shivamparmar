'use client';

import { useRef } from 'react';
import { clients } from '@/lib/content';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { tc } from '@/lib/v2';

/**
 * The brands, on cream, on one held screen: the headline starts large in the middle and settles to the top
 * while the logos arrive one by one into a grid — each from its own direction, growing into place — and the
 * whole grid then eases back a little, as if the camera pulls away.
 */
export default function V2BrandsScene() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const tiles = q('.v2-bs__grid li') as HTMLElement[];
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
    tl.fromTo(q('.v2-bs__title'), { y: '24vh', scale: 1.35 }, { y: 0, scale: 1, duration: 2, ease: 'power2.inOut' }, 0)
      .fromTo(tiles, {
        autoAlpha: 0, scale: .5,
        x: (i) => ((i % 7) - 3) * 40, y: (i) => (i < 7 ? -1 : 1) * 90 + ((i * 37) % 60) - 30,
        rotate: (i) => ((i * 53) % 24) - 12,
      }, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotate: 0, duration: 2.4, stagger: { each: .12, from: 'random' }, ease: 'power3.out' }, 1.1)
      .fromTo(q('.v2-bs__grid'), { scale: 1.1 }, { scale: 1, duration: 3 }, 1.1)
      .to({}, { duration: .8 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} className="v2-bs" aria-label={clients.tag}>
      <div className="v2-bs__stick">
        <h2 className="v2-bs__title">{tc(clients.title[0])} <em>{tc(clients.title[1], { start: false })}</em></h2>
        <ul className="v2-bs__grid" aria-label="Logos of brands I’ve worked with">
          {clients.logos.map((l) => (
            <li key={l.name}>{l.src ? <img src={l.src} alt={l.name} loading="lazy" /> : <span>{l.name}</span>}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The brands' headline and logo grid alone, for the products scene to animate. */
export function BrandsGrid() {
  return (
    <div className="v2-bs__in">
      <h2 className="v2-bs__title">{tc(clients.title[0])} <em>{tc(clients.title[1], { start: false })}</em></h2>
      <ul className="v2-bs__grid" aria-label="Logos of brands I’ve worked with">
        {clients.logos.map((l) => (
          <li key={l.name}>{l.src ? <img src={l.src} alt={l.name} loading="lazy" /> : <span>{l.name}</span>}</li>
        ))}
      </ul>
    </div>
  );
}
