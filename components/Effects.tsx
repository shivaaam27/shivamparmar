'use client';

import { gsap, ScrollTrigger, useGSAP, scramble, prefersReducedMotion } from '@/lib/motion';

/**
 * Page-wide scroll motion:
 *  - `.reveal` elements rise in (optional `data-delay="1..3"` staggers them)
 *  - `[data-scramble]` text decodes from SHIVAM letters
 *  - the header name hides while the work strips pass under it
 */
export default function Effects() {
  useGSAP(() => {
    const reduce = prefersReducedMotion();

    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      if (reduce) { gsap.set(el, { opacity: 1, y: 0 }); return; }
      gsap.fromTo(el, { opacity: 0, y: 32 }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        delay: Number(el.dataset.delay ?? 0) * 0.12,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // the header name steps aside while the work images pass beneath it
    const strips = document.querySelector('.strips');
    const header = document.querySelector('.site-header');
    if (strips && header) {
      ScrollTrigger.create({
        trigger: strips, start: 'top top+=90', end: 'bottom top+=20',
        toggleClass: { targets: header, className: 'site-header--over-work' },
      });
    }

    gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => scramble(el, el.classList.contains('site-footer__name') ? 1.1 : 0.7),
      });
    });
  });

  return null;
}
