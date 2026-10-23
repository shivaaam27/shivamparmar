'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll reveals: anything marked [data-reveal] gets .is-in when it comes into view, once.
 * The look (rise, grow, pop, draw) is in base.css; children read --d for their own small delay.
 */
export default function V2Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    // lines and rows of drawings that run on their own are paused while they are off screen (class is-off, app-home.css)
    const live = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '120px 0px' });
    const scan = () => {
      document.querySelectorAll('.v2 [data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
      document.querySelectorAll('.v2 :is(.v2-mq, .v2-ship__tile, .v2-jo, .v2-ph, .v2-ct, .v2-whero)').forEach((el) => live.observe(el));
    };
    scan();
    // pages that draw later (client lists) are picked up too, at most a few times a second
    let wait: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { if (!wait) wait = setTimeout(() => { wait = undefined; scan(); }, 250); });
    const root = document.querySelector('.v2 main');
    if (root) mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); live.disconnect(); mo.disconnect(); clearTimeout(wait); };
  }, [pathname]);
  return null;
}
