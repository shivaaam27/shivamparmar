'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { aboutPage, site } from '@/lib/content';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { tc, v2 } from '@/lib/v2';
import { pagedProjects, visibleCategories } from '@/lib/work';
import ScrollWords from './ScrollWords';
import Ribbons from './Ribbons';
import Count from './Count';
import { ArrowUR } from './Art';
import { LOOP, THIN } from './Hero';

/*
 * The About page told as held scenes, as the home page is (docs/V2-PLAN.md):
 *   AboutOpen → AboutDisciplines (+ the belief and the figures) → AboutHighlights (which turns into the brands)
 * then the contact screen and the footer. Every scene holds the screen while scrolling moves it on,
 * and each ends on the colour the next begins with, so there are no seams.
 */

const pad = (n: number) => String(n).padStart(2, '0');

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
 * Cream, "Hi, I'm Shivam." and the loop line drawing in behind it. Scrolling, the screen turns deep green, the
 * greeting rises to the top, and the introduction fills in word by word; then the words leave and the screen is
 * plain green for the next scene to open over.
 */
export function AboutOpen() {
  const root = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);
  const { headline, eyebrow, intro } = aboutPage;
  const [hi, name] = headline[0].split(/,\s*/);

  useEffect(() => { const t = setTimeout(() => setDrawn(true), 350); return () => clearTimeout(t); }, []);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const words = q('.v2-sw__w') as HTMLElement[];
    const marks = q('.v2-sw__hl') as HTMLElement[];
    gsap.set(words, { opacity: .14 });
    gsap.set(q('.v2-abo__body, .v2-abo__end'), { autoAlpha: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - 2 * window.innerHeight}`, scrub: .7, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const filled = gsap.utils.clamp(0, 1, (st.progress - .3) / .45) * words.length;
          marks.forEach((m) => m.classList.toggle('is-on', filled > Number(m.dataset.at)));
          if (st.progress > .02) setDrawn(true);
          el.classList.toggle('is-dark', st.progress > .06);
        },
      },
    });
    tl.to(q('.v2-abo__eyebrow'), { autoAlpha: 0, y: -20, duration: .8 }, 0)
      .to(q('.v2-scene__stick'), { backgroundColor: '#0A2E20', duration: 1.6, ease: 'power1.inOut' }, .2)
      .to(q('.v2-abo__title'), { y: () => -window.innerHeight * .27, scale: .62, color: '#fff', duration: 1.6, ease: 'power2.inOut' }, .2)
      .to(q('.v2-hloop'), { opacity: .22, duration: 1.4 }, .4)
      .to(q('.v2-abo__body'), { autoAlpha: 1, duration: .4 }, 1.5)
      .to(words, { opacity: 1, duration: 3.6, stagger: { amount: 3.6 } }, 1.7)
      .to(q('.v2-abo__end'), { autoAlpha: 1, y: 0, duration: .8 }, 5.4)
      .to({}, { duration: 1 })
      .to(q('.v2-abo__title, .v2-abo__body, .v2-abo__end, .v2-hloop'), { autoAlpha: 0, y: '-=50', duration: 1.1, ease: 'power2.in' })
      .to({}, { duration: .05 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} className={`v2-scene v2-abo${drawn ? ' is-done' : ''}`} aria-label="Hello">
      <div className="v2-scene__stick">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-abo__head">
          <p className="v2-abo__eyebrow">{eyebrow.split(' · ').map((e) => tc(e)).join('  ·  ')}</p>
          <h1 className="v2-abo__title">{hi}, <em>{name}</em></h1>
        </div>
        <div className="v2-abo__body">
          <ScrollWords className="v2-abo__text" controlled
            parts={split(intro[0], ['websites, apps and custom systems', 'AI workflows', 'functional at their core and considered in every detail'])} />
          <div className="v2-abo__end">
            <Link className="v2-btn v2-btn--lime" href={v2('/work')}>See the work<span className="v2-btn__dot"><ArrowUR /></span></Link>
            <a className="v2-more" href={`mailto:${site.email}`} data-umami-event="Contact · V2 About email">Email me <ArrowUR /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. what I do, then the figures */

const HREF: Record<string, string> = {
  'Systems & apps': '/services/custom-software',
  'AI & prompt engineering': '/services/ai-automation',
  Design: '/services/branding-and-social-media',
  Photography: '/work/photography',
};

/**
 * What I do, one discipline at a time on the held green screen: each photograph fills in from the top over the last
 * one while its words rise beside it. Then, scrolling on normally on the same green, the belief and the figures.
 */
export function AboutDisciplines() {
  const root = useRef<HTMLElement>(null);
  const { disciplines, intro } = aboutPage;
  const n = disciplines.length;

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const pin = q('.v2-adc__pin')[0] as HTMLElement;
    const texts = q('.v2-adc__text') as HTMLElement[];
    const pics = q('.v2-adc__pic') as HTMLElement[];
    const ticks = q('.v2-adc__ticks i') as HTMLElement[];
    gsap.set(q('.v2-adc__head > *'), { autoAlpha: 0, y: 40 });
    gsap.set(texts, { autoAlpha: 0, y: 60 });
    gsap.set(pics, { clipPath: 'inset(0% 0% 100% 0% round 24px)' });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: pin, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } });
    tl.set(q('.v2-adc__stick'), { backgroundColor: '#0A2E20' })
      .to(q('.v2-adc__head > *'), { autoAlpha: 1, y: 0, duration: .8, stagger: .15, ease: 'power3.out' });
    pics.forEach((p, i) => {
      const at = 1 + i * 2.2;
      if (i > 0) tl.to(texts[i - 1], { autoAlpha: 0, y: -50, duration: .6, ease: 'power2.in' }, at - .2);
      tl.to(p, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.1, ease: 'power2.out' }, at)
        .fromTo(p.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 2, ease: 'power2.out' }, at)
        .to(texts[i], { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out' }, at + .3)
        .to(ticks[i], { '--on': 1, duration: .6 }, at);
    });
    tl.to({}, { duration: 1.2 });
    (q('.v2-adc__rise') as HTMLElement[]).forEach((item) => {
      gsap.fromTo(item, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%' } });
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  const stats = useStats();
  return (
    <section ref={root} className="v2-adc v2-dark" id="services" aria-label="What I do">
      <div className="v2-adc__pin" style={{ '--n': n } as React.CSSProperties}>
        <div className="v2-adc__stick">
          <div className="v2-adc__grid">
            <div className="v2-adc__copy">
              <div className="v2-adc__head">
                <p className="v2-adc__kicker">What I do</p>
                <h2 className="v2-adc__h">{tc('Five disciplines,')} <em>{tc('one way of working.', { start: false })}</em></h2>
              </div>
              <div className="v2-adc__texts">
                {disciplines.map((d, i) => (
                  <div key={d.title} className="v2-adc__text">
                    <p className="v2-adc__n">{pad(i + 1)} / {pad(n)}</p>
                    <h3 className="v2-adc__t">{tc(d.title)}</h3>
                    <p className="v2-adc__p">{d.text}</p>
                    {HREF[d.title] && (
                      <Link className="v2-more" href={v2(HREF[d.title])}>{d.title === 'Photography' ? 'See the photographs' : 'How it works'} <ArrowUR /></Link>
                    )}
                  </div>
                ))}
              </div>
              <div className="v2-adc__ticks" aria-hidden="true">{disciplines.map((d) => <i key={d.title} />)}</div>
            </div>
            <div className="v2-adc__pics">
              {disciplines.map((d) => d.image && (
                <figure key={d.title} className="v2-adc__pic"><img src={d.image} alt={d.title} loading="lazy" /></figure>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the belief and the figures, on the same green */}
      <div className="v2-adc__body" id="numbers">
        <div className="v2-adc__cols">
          <p className="v2-adc__lead v2-adc__rise">
            {split(intro[1], ['technical precision with emotional depth', 'resonate with the people they serve', 'long-term growth']).map((p, i) => (p.hl ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}
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

/* ------------------------------------------------------------------ 3. highlights */

/**
 * The eight things built and shipped, as cards on one held green screen that slide sideways as you scroll, each
 * with its own moving line. Then the same screen turns cream and the brands arrive: the headline settles and the logos fly into a grid.
 */
export function AboutHighlights({ children }: { children?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const { highlights } = aboutPage;

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const track = q('.v2-ahl__track')[0] as HTMLElement;
    const tiles = q('.v2-bs__grid li') as HTMLElement[];
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.set(q('.v2-ahl__brands'), { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } });
    tl.fromTo(track, { x: 0 }, { x: () => -dist(), duration: 7 })
      .to({}, { duration: .5 })
      // the same screen turns cream and becomes the brands
      .to(q('.v2-ahl__track, .v2-ahl__head'), { autoAlpha: 0, y: -40, duration: 1, ease: 'power2.in' })
      .to(q('.v2-ahl__stick'), { backgroundColor: '#F4F1E6', duration: 1.2, ease: 'power1.inOut' }, '<.3')
      .set(q('.v2-ahl__brands'), { autoAlpha: 1 }, '<.5')
      .fromTo(q('.v2-bs__title'), { autoAlpha: 0, y: '18vh', scale: 1.3 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.8, ease: 'power2.inOut' }, '<')
      .fromTo(tiles, {
        autoAlpha: 0, scale: .5,
        x: (i) => ((i % 7) - 3) * 40, y: (i) => (i < 7 ? -1 : 1) * 90 + ((i * 37) % 60) - 30, rotate: (i) => ((i * 53) % 24) - 12,
      }, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotate: 0, duration: 2, stagger: { each: .1, from: 'random' }, ease: 'power3.out' }, '<.9')
      .to({}, { duration: .8 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} className="v2-ahl v2-dark" id="highlights" aria-label="Highlights">
      <div className="v2-ahl__stick">
        <header className="v2-ahl__head">
          <h2 className="v2-ahl__h">{tc(highlights.title[0])} <em>{tc(highlights.title[1], { start: false })}</em></h2>
          <p className="v2-ahl__hint">{pad(highlights.items.length)} highlights · keep scrolling</p>
        </header>
        <ol className="v2-ahl__track">
          {highlights.items.map((h, i) => (
            <li key={h.title} className="v2-ahl__card">
              <div className="v2-ahl__art"><Ribbons set={`h${i + 1}`} /></div>
              <span className="v2-ahl__n">{pad(i + 1)}</span>
              <b className="v2-ahl__t">{tc(h.title)}</b>
              <p className="v2-ahl__p">{h.text}</p>
            </li>
          ))}
        </ol>
        {children && <div className="v2-ahl__brands">{children}</div>}
      </div>
    </section>
  );
}
