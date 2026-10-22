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
    const scan = () => document.querySelectorAll('.v2 [data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    // pages that draw later (client lists) are picked up too, at most a few times a second
    let wait: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { if (!wait) wait = setTimeout(() => { wait = undefined; scan(); }, 250); });
    const root = document.querySelector('.v2 main');
    if (root) mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(wait); };
  }, [pathname]);
  return null;
}
