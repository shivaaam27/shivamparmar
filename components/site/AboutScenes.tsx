'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { aboutPage, site } from '@/lib/content';
import { copy, parts } from '@/lib/copy';
import { PACE, fitScene, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { tc } from '@/lib/title-case';
import { pagedProjects, visibleCategories } from '@/lib/work';
import ScrollWords from './ScrollWords';
import Count from './Count';
import { ArrowUR } from './Art';
import { LOOP, THIN } from './Hero';

/*
 * The About page told as held scenes, as the home page is (docs/SITE.md):
 *   AboutOpen → AboutBelief (the belief and the figures), then the cream rows (built and shipped, products) and the services
 * (app/(site)/about/page.tsx), the contact screen and the footer. Every scene holds the screen while scrolling moves it on,
 * and each ends on the colour the next begins with, so there are no seams.
 */

/** Splits a text so the given phrases can be set apart (bold, or marked). */
function split(text: string, phrases: string[]) {
  const out: { t: string; hl: boolean }[] = [];
  let rest = text;
  while (rest) {
    const hits = phrases.map((p) => ({ p, i: rest.indexOf(p) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
    if (!hits.length) { out.push({ t: rest, hl: false }); break; }
    const { p, i } = hits[0];
    if (i) out.push({ t: rest.slice(0, i), hl: false });
    out.push({ t: p, hl: true });
    rest = rest.slice(i + p.length);
  }
  return out;
}

/* ------------------------------------------------------------------ 1. opening */

/**
 * The page opens on the introduction: the title "About" rises in by itself, and the introduction under it fills in
 * word by word as you scroll, then the two links. The screen simply stays put until it is read.
 */
/** Screens after the opening's words: just the held screen itself. */
const OPEN_REST = 1;

export function AboutOpen() {
  const root = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);
  const { intro } = aboutPage;

  useEffect(() => { const t = setTimeout(() => setDrawn(true), 350); return () => clearTimeout(t); }, []);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const words = q('.v2-sw__w') as HTMLElement[];
    const marks = q('.v2-sw__hl') as HTMLElement[];
    gsap.set(words, { opacity: .14 });
    gsap.set(q('.v2-abo__end'), { autoAlpha: 0, y: 14 });
    // the title arrives on its own, as the page opens
    gsap.fromTo(q('.v2-abo__title'), { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power3.out', delay: .15 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - OPEN_REST * window.innerHeight}`, scrub: PACE.scrub, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const filled = gsap.utils.clamp(0, 1, (st.progress - .02) / .7) * words.length;
          marks.forEach((m) => m.classList.toggle('is-on', filled > Number(m.dataset.at)));
          if (st.progress > .02) setDrawn(true);
        },
      },
    });
    tl.to(words, { opacity: 1, duration: 3.6, stagger: { amount: 3.6 } }, 0)
      .to(q('.v2-abo__end'), { autoAlpha: 1, y: 0, duration: .8 }, 3.8)
      .to({}, { duration: .8 });
    fitScene(el, tl, OPEN_REST);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} className={`v2-scene v2-abo${drawn ? ' is-done' : ''}`} aria-label="About">
      <div className="v2-scene__stick">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-abo__head">
          <h1 className="v2-abo__title">{copy('about.title', 'About')}</h1>
        </div>
        <div className="v2-abo__body">
          <ScrollWords className="v2-abo__text" controlled
            parts={parts(aboutPage.introRich[0])} />
          <div className="v2-abo__end">
            <Link className="v2-btn" href={'/work'}>See the work<span className="v2-btn__dot"><ArrowUR /></span></Link>
            <a className="v2-btn" href={`mailto:${site.email}`} data-umami-event="Contact · About email">Email me<span className="v2-btn__dot"><ArrowUR /></span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. the belief and the figures */

/** The belief beside the figures, on the same green the opening ends on; each rises in as it comes into view. */
export function AboutBelief() {
  const root = useRef<HTMLElement>(null);
  const { intro } = aboutPage;

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    (gsap.utils.toArray<HTMLElement>('.v2-adc__rise', root.current)).forEach((item) => {
      gsap.fromTo(item, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%' } });
    });
  }, { scope: root });

  const stats = useStats();
  return (
    <section ref={root} className="v2-adc v2-dark" id="numbers" aria-label="What I believe">
      <div className="v2-adc__body">
        <div className="v2-adc__cols">
          <p className="v2-adc__lead v2-adc__rise">
            {parts(aboutPage.introRich[1]).map((p, i) => (p.hl ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}
          </p>
          <ul className="v2-adc__stats">
            {stats.map((s) => (
              <li key={s.label} className="v2-adc__rise"><span>{s.pre}</span><b><Count value={s.value} /></b><span>{s.label}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The figures, worked out from the site's own work. */
function useStats() {
  const projects = pagedProjects();
  const photo = visibleCategories().find((c) => c.slug === 'photography');
  const photos = projects.filter((p) => p.category.slug === 'photography').reduce((m, p) => m + (p.project.images?.length ?? 0), 0);
  return [
    { pre: 'On this site', value: projects.length, label: 'projects' },
    { pre: 'Across', value: photo?.subcategories.length ?? 0, label: 'photo collections' },
    { pre: 'More than', value: Math.floor(photos / 5) * 5, label: 'photographs' },
    { pre: 'Speaks', value: aboutPage.facts.find((f) => f.label === 'Languages')?.value.split(',').length ?? 4, label: 'languages' },
  ];
}
