'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

type Role = { years: string; role: string; place: string; text: string; group: string };

/**
 * The journey as a timeline that draws itself as you scroll: a sage line grows down through
 * each group, every dot fills as the line reaches it, and the years, role and words rise in
 * just behind. Roles are grouped (Work, then Education) in the order they are listed; the
 * newest role keeps its green dot. Still and complete for anyone who prefers reduced motion.
 */
export default function Timeline({ items }: { items: Role[] }) {
  const root = useRef<HTMLDivElement>(null);
  const groups = [...new Set(items.map((r) => r.group))];

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    el.classList.add('is-live');

    gsap.utils.toArray<HTMLElement>('.ab-tl__group', el).forEach((group) => {
      // the line follows the reading point down the group
      gsap.fromTo(group.querySelector('.ab-tl__fill'), { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: group.querySelector('.ab-tl__list'), start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
      });
      gsap.fromTo(group.querySelector('.ab-tl__head'), { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: group, start: 'top 82%', toggleActions: 'play none none reverse' },
      });

      gsap.utils.toArray<HTMLElement>('li', group).forEach((li) => {
        const parts = li.querySelectorAll('.ab-tl__years, .ab-tl__role b, .ab-tl__role em, .ab-tl__text');
        const tl = gsap.timeline({ paused: true })
          .fromTo(parts, { opacity: 0, y: 18, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, stagger: 0.07, ease: 'power3.out' });
        ScrollTrigger.create({
          trigger: li, start: 'top 72%',
          onEnter: () => { li.classList.add('is-past'); tl.play(); },
          onLeaveBack: () => { li.classList.remove('is-past'); tl.reverse(); },
        });
      });
    });
  }, { scope: root });

  return (
    <div ref={root} className="ab-tl">
      {groups.map((g) => (
        <section key={g} className="ab-tl__group" aria-label={g}>
          <span className="ab-tl__line" aria-hidden="true"><span className="ab-tl__fill" /></span>
          <h3 className="ab-tl__head">{g}</h3>
          <ol className="ab-tl__list">
            {items.filter((r) => r.group === g).map((r) => (
              <li key={`${r.years}-${r.role}`} className={r === items[0] ? 'is-now' : undefined}>
                <span className="ab-tl__years">{r.years}</span>
                <span className="ab-tl__dot" aria-hidden="true" />
                <span className="ab-tl__role"><b>{r.role}</b><em>{r.place}</em></span>
                <span className="ab-tl__text">{r.text}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
