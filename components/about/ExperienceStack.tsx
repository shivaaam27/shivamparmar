'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';

type Role = { years: string; role: string; place: string; text: string };

/** Of a card, how much stays showing once the next lands on it: its years and title
 *  (on narrow screens they sit on two lines; if the pile wouldn't fit, just the years). */
const PEEK_REM = { wide: 2.6, narrow: 3.7, least: 2.35 };
const GAP = 16;       // between the top card and the faint one waiting below it
const NEXT = 0.3;     // how visible the waiting card is

/**
 * The journey as a pile of cards. The section holds still while you scroll
 * through it, and each step lifts the next role up onto the pile: it rises
 * from a faint preview below, the cards beneath sink back a little, and each
 * keeps its years and title showing. It stops with the last one whole, then
 * the page moves on. Without JS, or with reduced motion, it's a plain list.
 */
export default function ExperienceStack({ items }: { items: Role[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const ol = el?.querySelector('ol');
    const section = el?.closest('section');
    if (!el || !ol || !section || prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;
    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        el.classList.add('is-stacked');
        const cards = Array.from(ol.children) as HTMLElement[];
        const n = cards.length;
        const narrow = window.innerWidth < 1000;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const h = cards.map((c) => c.offsetHeight);

        // clear the header (and on narrow screens the section strip pinned under it)
        const side = document.querySelector<HTMLElement>('.ab-side');
        const offset = narrow && side ? side.offsetHeight + 24 : 104;
        const pad = parseFloat(getComputedStyle(section).paddingTop) || 0;

        // the whole pile has to fit on screen while it's held
        const above = ol.getBoundingClientRect().top - section.getBoundingClientRect().top - pad;
        const room = (window.innerHeight - offset - above - h[n - 1] - 24) / (n - 1);
        // years and title side by side down to 720px (see about.css), stacked below that
        const stackedRows = window.innerWidth <= 720;
        const peek = Math.max(PEEK_REM.least * rem, Math.min((stackedRows ? PEEK_REM.narrow : PEEK_REM.wide) * rem, room));
        const at = (k: number) => k * peek;                          // where card k rests on the pile
        const below = (k: number) => at(k - 1) + h[k - 1] + GAP;     // where card k waits, under the one before

        ol.style.height = `${Math.max(at(n - 1) + h[n - 1], below(1) + h[1] * NEXT)}px`;
        cards.forEach((c, k) => gsap.set(c, {
          y: k === 0 ? 0 : below(k) + (k === 1 ? 0 : 60),
          opacity: k === 0 ? 1 : k === 1 ? NEXT : 0,
          scale: k === 0 ? 1 : 0.96, transformOrigin: '50% 0%',
        }));

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: section, pin: true, start: `top+=${pad} ${offset}px`,
            end: `+=${(n - 1) * window.innerHeight * 0.42}`,
            scrub: 0.7,
            snap: { snapTo: 'labels', duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
          },
        });
        tl.addLabel('s0');
        for (let k = 1; k < n; k++) {
          const t = k - 1;
          tl.to(cards[k], { y: at(k), opacity: 1, scale: 1 }, t);
          if (k + 1 < n) tl.to(cards[k + 1], { y: below(k + 1), opacity: NEXT }, t);
          for (let j = 0; j < k; j++) tl.to(cards[j], { scale: 1 - Math.min(k - j, 4) * 0.014 }, t);
          tl.addLabel(`s${k}`, t + 1);
        }
      }, el);
      ScrollTrigger.refresh();
    };

    build();
    let timer = 0;
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;   // phones fire resize as the address bar moves
      width = window.innerWidth;
      clearTimeout(timer);
      timer = window.setTimeout(build, 200);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); ctx?.revert(); el.classList.remove('is-stacked'); ol.style.height = ''; };
  }, []);

  return (
    <div className="ab-stack" ref={root}>
      <ol className="ab-rows">
        {items.map((r, i) => (
          <li key={i}>
            <span className="ab-rows__years">{r.years}</span>
            <span className="ab-rows__role"><b>{r.role}</b><em>{r.place}</em></span>
            <span className="ab-rows__text">{r.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
