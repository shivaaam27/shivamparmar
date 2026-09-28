'use client';

import { gsap, ScrollTrigger, useGSAP, scramble, prefersReducedMotion } from '@/lib/motion';

/**
 * Page-wide scroll motion:
 *  - `.reveal` elements rise in (optional `data-delay="1..3"` staggers them)
 *  - `[data-scramble]` text decodes from SHIVAM letters
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
