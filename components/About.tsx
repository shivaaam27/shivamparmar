'use client';

import { useRef } from 'react';
import { about } from '@/lib/content';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';

/**
 * Scroll-told intro: the section pins, "Hi, I'm Shivam" rises in, then the
 * rest of the headline, then the description fills word by word from grey
 * to ink as you keep scrolling, and the link arrives last.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
  const words = about.body.split(' ');

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const [first, ...rest] = q('.about__line');
    const bodyWords = q('.about__word');
    const body = q('.about__text .lead');
    const link = q('.about__sign');

    if (prefersReducedMotion()) {
      gsap.set([first, ...rest, body, bodyWords, link], { opacity: 1 });
      return;
    }

    // on the home page the intro screen stays put underneath (sticky hero): this section starts
    // over it, so its timeline begins at the very top and the first line rises as the light sets
    const overHero = !!document.querySelector('.hero:has(.avatar)');

    if (!overHero) {
      // first line rises in as the section scrolls into view
      gsap.fromTo(first, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 20%', scrub: true },
      });
    }

    let readSent = false;
    // then the section holds while the rest plays out with the scroll
    const tall = () => (root.current?.offsetHeight ?? 0) > window.innerHeight;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: () => (tall() ? 'bottom bottom' : 'top top'),
        end: () => `+=${window.innerHeight * (overHero ? 3 : 2.2)}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        // counts once per visit: someone scrolled the whole intro through
        onLeave: () => { if (!readSent) { readSent = true; track('Read about to the end'); } },
      },
    });
    if (overHero) {
      // "Hi, I'm Shivam" rises out of the setting light: it starts where the SHIVAM mark sits,
      // small, soft and faint, and travels up into place, sharpening as it goes
      const fromMark = () => {
        const mark = document.querySelector('.hero .jumble');
        if (!mark || !root.current) return 120;
        const m = mark.getBoundingClientRect();
        const f = first.getBoundingClientRect();
        const lineMid = f.top + f.height / 2 - Number(gsap.getProperty(first, 'y')) - root.current.getBoundingClientRect().top;
        return Math.max(60, m.top + m.height / 2 - lineMid);
      };
      tl.to({}, { duration: 0.5 })
        .fromTo(first, { y: fromMark, scale: 0.9, filter: 'blur(10px)' },
          { y: 0, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'sine.inOut' }, 'rise')
        // it comes into view on the way up, just as the old mark finishes fading
        .fromTo(first, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' }, 'rise+=0.15');
    }
    tl.fromTo(rest, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.35, ease: 'power2.out' }, overHero ? '-=0.35' : undefined)
      // the description arrives in full, in grey, as the headline finishes…
      .fromTo(body, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      // …then fills to ink word by word
      .fromTo(bodyWords, { opacity: 0.22 }, { opacity: 1, duration: 0.3, stagger: 0.06, ease: 'none' }, '+=0.1')
      .fromTo(link, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
      .to({}, { duration: 0.6 }); // a short beat of stillness before the pin releases
  }, { scope: root });

  return (
    <section ref={root} className="about section" id="about">
      <div className="about__inner">
        <h2 className="headline">
          {about.headline.map((line) => <span key={line} className="about__line">{line}</span>)}
        </h2>

        <div className="about__text">
          <p className="lead" aria-label={about.body}>
            {words.map((w, i) => (
              <span key={i} className="about__word" aria-hidden="true">{w}{i < words.length - 1 ? ' ' : ''}</span>
            ))}
          </p>
          <a className="about__sign" href={about.link.href}>
            {about.link.label}<span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
