'use client';

import { gsap, ScrollTrigger, useGSAP, scramble } from '@/lib/motion';

/**
 * Page-wide scroll motion:
 *  - `[data-scramble]` text (the footer name) decodes from SHIVAM letters
 *  - the header name hides while the work index passes under it
 * Section content doesn't fade in on scroll any more: it simply shows.
 */
export default function Effects() {
  useGSAP(() => {
    // the header name steps aside while the work list and frame pass beneath it
    const strips = document.querySelector('.work__reel');
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
