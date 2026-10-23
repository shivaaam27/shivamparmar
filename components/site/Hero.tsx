'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { about, hero, site } from '@/lib/content';
import { tc } from '@/lib/title-case';
import { PACE, RISE, ScrollTrigger, fitScene, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import HeroLogo from './HeroLogo';
import ScrollWords from './ScrollWords';
import { ArrowUR } from './Art';
import { marked } from './Home';

/** One long line that curls into loops on both sides of the logo (the contact card's loop, drawn across the screen). */
export const LOOP = 'M-60 650C120 640 220 560 300 520s170-60 180 30-90 150-150 110-30-150 70-180 230-40 330 20 130 150 260 140 220-110 290-170 150-90 230-20 10 150-80 140-110-120 0-190 230-100 420-140';
/** A fine second line with its own gentle path. */
export const THIN = 'M-40 760C180 720 330 780 520 740s300-110 470-90 260 110 520 40';

/**
 * The opening scene, one screen that stays put while you scroll (as Apple's pages do):
 *  1. the hero — the logo intro on cream, the loop line drawing itself in behind it, the services along the bottom;
 *  2. scrolling, the page itself turns deep green, the logo and services drift away, and the loop line stays,
 *     glowing lime on the dark;
 *  3. the About headline rises in its place, its words fill in as you keep scrolling, then the link;
 *  4. a short hold, then the cream page (Work) rises over it, from the bottom, as a rounded card that grows to full screen.
 * With reduced motion it is two plain screens, one after the other.
 */
export default function V2Hero() {
  const root = useRef<HTMLElement>(null);
  const [done, setDone] = useState(false);
  const [drawn, setDrawn] = useState(false);
  // the line starts drawing with the logo and finishes about when the logo does
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 150); return () => clearTimeout(t); }, []);
  const [first, second] = about.headline;
  const before = first.replace(about.scramble, '').replace(/,\s*$/, '').trim();

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    // the colour the scene settles on is the page's own deep colour (the page's --forest), read again on every refresh,
    // so the light / dark button can change it without reloading the page
    const deep = () => getComputedStyle(el).getPropertyValue('--forest').trim() || '#2B6444';
    const words = q('.v2-sw__w') as HTMLElement[];
    const marks = q('.v2-sw__hl') as HTMLElement[];
    gsap.set(q('.v2-scene__about'), { autoAlpha: 0 });
    gsap.set(q('.v2-scene__line'), { autoAlpha: 0, y: 70 });
    gsap.set(q('.v2-scene__pill'), { scale: .4, rotate: -12, autoAlpha: 0 });
    gsap.set(words, { opacity: .14 });
    gsap.set(q('.v2-scene__end'), { autoAlpha: 0, y: 20 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        // the story ends RISE screens early: the cream page (Work) rises over About while it stays held
        trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - (1 + RISE) * window.innerHeight}`, scrub: PACE.scrub, invalidateOnRefresh: true,
        onUpdate: (st) => {
          // the marker under each key phrase once the reading reaches it
          const filled = gsap.utils.clamp(0, 1, (st.progress - .52) / .36) * words.length;
          marks.forEach((m) => m.classList.toggle('is-on', filled > Number(m.dataset.at)));
          el.classList.toggle('is-dark', st.progress > .14);
          // scrolled on before the logo finished: draw the line now, so About never opens without it
          if (st.progress > .04) { setDone(true); setDrawn(true); }
        },
      },
    });
    // 1 → 2: the logo and services leave, the page turns deep green, the line brightens
    tl.to(q('.v2-hero__stage'), { autoAlpha: 0, scale: .9, y: -50, duration: 2.2, ease: 'power1.in' }, 0)
      .to(q('.v2-hero__foot'), { autoAlpha: 0, y: 20, duration: 1.2 }, 0)
      .to(q('.v2-scene__stick'), { backgroundColor: () => deep(), duration: 2.4, ease: 'power1.inOut' }, .6)
      .to(q('.v2-hloop'), { scale: 1.08, duration: 10 }, 0)
      // 3: About rises in the same place
      .to(q('.v2-scene__about'), { autoAlpha: 1, duration: .4 }, 2.6)
      .to(q('.v2-scene__line'), { autoAlpha: 1, y: 0, duration: 1.4, stagger: .35, ease: 'power2.out' }, 2.7)
      .to(q('.v2-scene__pill'), { autoAlpha: 1, scale: 1, rotate: -2, duration: 1, ease: 'back.out(2)' }, 3.4)
      .to(words, { opacity: 1, duration: 4, stagger: { amount: 4 } }, 4.6)
      .to(q('.v2-scene__end'), { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' }, 8.8)
      // a short hold to finish reading; then the cream page rises over About as it stands (the next section)
      .to({}, { duration: .8 });
    fitScene(el, tl, 1 + RISE);
    // once the cream page has covered the scene, its lines and light stop moving (nothing on screen shows them)
    const covered = ScrollTrigger.create({
      trigger: el, start: () => `bottom ${RISE * 100}%`, end: '+=99999',
      onToggle: (s) => el.classList.toggle('is-covered', s.isActive),
    });
    return () => { covered.kill(); tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  // the line leans a little toward the pointer (eased); not on touch screens or with reduced motion
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const frame = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(frame) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1; ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }, []);

  return (
    <section ref={root} className={`v2-scene${done ? ' is-done' : ''}${drawn ? ' is-drawn' : ''}`} aria-label="Intro and about">
      <div className="v2-scene__stick">
        {/* the contact card's loop line, large: it draws itself in while the logo forms, fades where it meets
            the words, and green light keeps running along it */}
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run v2-hloop__run--late" d={LOOP} pathLength={1} />
        </svg>

        <div className="v2-hero__stage">
          <HeroLogo delay={0.2} onDone={() => setDone(true)} />
        </div>
        <ul className="v2-hero__foot" aria-label={`What Shivo Labs does, from ${site.location}`}>
          {hero.footer.map((s) => <li key={s}>{tc(s)}</li>)}
        </ul>

        {/* About, in the same place */}
        <div className="v2-scene__about" id="about">
          <h2 className="v2-scene__title" aria-label={about.headline.join(' ')}>
            <span className="v2-scene__line" aria-hidden="true">{tc(before)}</span>
            <span className="v2-scene__line" aria-hidden="true"><span className="v2-scene__pill">{tc(about.scramble, { start: false })}</span>,</span>
            <span className="v2-scene__line" aria-hidden="true">{tc(second, { start: false })}</span>
          </h2>
          <ScrollWords className="v2-scene__body" parts={marked(about.bodyRich)} controlled />
          <div className="v2-scene__end">
            <Link className="v2-btn" href={about.link.href}>{about.link.label}<span className="v2-btn__dot"><ArrowUR /></span></Link>
            <p className="v2-scene__note">{about.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
