'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { aboutPage, site } from '@/lib/content';
import { copy, parts } from '@/lib/copy';
import { PACE, fitScene, gsap, useGSAP } from '@/lib/motion';
import ScrollWords from './ScrollWords';
import { ArrowUR } from './Art';

/** The single editable description becomes a sequence of paragraphs in one held frame. */
export function AboutOpen() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (min-height: 600px)', () => {
      const panels = Array.from(el.querySelectorAll<HTMLElement>('.v2-about-story__panel'));
      const links = el.querySelector('.v2-about-intro__links');
      el.classList.add('is-animated');
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 28 });
      gsap.set(links, { autoAlpha: 0, y: 12 });
      panels.slice(1).forEach(panel => gsap.set(panel.querySelectorAll('.v2-sw__w'), { opacity: .16 }));
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - window.innerHeight}`,
          scrub: PACE.scrub, invalidateOnRefresh: true,
        },
      });
      timeline.to({}, { duration: 1 });
      panels.forEach((panel, index) => {
        if (index > 0) {
          timeline.to(panels[index - 1], { autoAlpha: 0, y: -28, duration: .55 })
            .to(panel, { autoAlpha: 1, y: 0, duration: .55 })
            .to(panel.querySelectorAll('.v2-sw__w'), { opacity: 1, duration: .4, stagger: { amount: Math.max(1.1, panel.innerText.split(/\s+/).length * .025) } });
        }
        timeline.to({}, { duration: .75 });
      });
      timeline.to(links, { autoAlpha: 1, y: 0, duration: .55 }).to({}, { duration: 1 });
      fitScene(el, timeline, 1);
      return () => { timeline.scrollTrigger?.kill(); timeline.kill(); el.classList.remove('is-animated'); el.style.removeProperty('height'); };
    });
    return () => media.revert();
  }, { scope: root });

  return (
    <section ref={root} className="v2-about-intro v2-about-story" aria-labelledby="about-title">
      <div className="v2-about-story__frame">
        <h1 id="about-title" className="v2-wo__heading">{copy('about.title', 'About')}</h1>
        <div className="v2-about-intro__body">
          <div className="v2-about-story__panels">
            {aboutPage.introRich.map((text, index) => (
              <div className="v2-about-story__panel" key={index}>
                <ScrollWords controlled parts={parts(text)} />
              </div>
            ))}
          </div>
          <div className="v2-about-intro__links">
            <Link className="v2-btn" href="/work">See the work<span className="v2-btn__dot"><ArrowUR /></span></Link>
            <a className="v2-btn" href={`mailto:${site.email}`} data-umami-event="Contact · About email">Email me<span className="v2-btn__dot"><ArrowUR /></span></a>
          </div>
        </div>
      </div>
    </section>
  );
}