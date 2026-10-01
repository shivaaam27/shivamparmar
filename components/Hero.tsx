'use client';

import { useRef } from 'react';
import { hero } from '@/lib/content';
import { gsap, useGSAP, POOL, rand, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

import HeroAvatar from './HeroAvatar';

const ROWS = 5;
const NAME_ROW = 2; // zero-based centre row
const COLS = hero.word.length;

/**
 * Where every letter comes to rest: a Latin square around the name (no row or
 * column repeats a letter), with EST on top and the year along the bottom.
 */
const SETTLED = ['ESTIVH', 'MVAHSI', 'SHIVAM', 'IASMHV', 'HM1998'];
/** How small the mark sits once it has settled. */
const REST_SCALE = { desktop: 0.62, phone: 0.8 };

/**
 * A grid of jumbled letters rolls; the centre row locks into the name left
 * to right, the rest settle into a fixed grey square (EST … 1998), and the
 * whole mark eases down to a smaller resting size where it stays.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const cells = gsap.utils.toArray<HTMLElement>('.jumble__cell', root.current);
    const spans = cells.map((c) => c.firstElementChild as HTMLElement);
    const html = document.documentElement;
    const name = hero.word;

    const isName = (i: number) => Math.floor(i / COLS) === NAME_ROW;
    const col = (i: number) => i % COLS;
    const row = (i: number) => Math.floor(i / COLS);

    const finish = () => html.classList.add('intro-done');
    const jumble = root.current!.querySelector<HTMLElement>('.jumble')!;
    const restScale = () => (window.matchMedia('(max-width: 720px)').matches ? REST_SCALE.phone : REST_SCALE.desktop);

    // show the settled mark straight away (no intro)
    const settleNow = () => {
      cells.forEach((cell, i) => {
        spans[i].textContent = SETTLED[row(i)][col(i)];
        cell.classList.add(isName(i) ? 'is-locked' : 'is-settled');
      });
      gsap.set(jumble, { scale: restScale() });
      finish();
    };
    // a refresh part-way down the page (or a link to #work) skips the intro, so
    // the header and page are ready at once instead of waiting for it off screen
    const awayFromTop = () => window.scrollY > window.innerHeight * 0.5 || (location.hash && location.hash !== '#top');

    if (prefersReducedMotion() || awayFromTop()) { settleNow(); return; }

    let tick: ReturnType<typeof setInterval> | undefined;
    let tl: gsap.core.Timeline | undefined;

    const play = () => {
      tl?.kill();
      clearInterval(tick);
      html.classList.remove('intro-done');
      const locked = new Set<number>();

      cells.forEach((cell, i) => {
        cell.classList.remove('is-locked', 'is-settled');
        spans[i].textContent = rand(POOL);
      });
      gsap.set(jumble, { scale: 1 });

      const roll = (i: number, letter: string) => {
        spans[i].textContent = letter;
        gsap.fromTo(spans[i], { yPercent: 45, opacity: 0.35 }, { yPercent: 0, opacity: 1, duration: 0.15, ease: 'power3.out' });
      };

      // keep unlocked letters rolling
      tick = setInterval(() => {
        spans.forEach((span, i) => {
          if (locked.has(i) || Math.random() > 0.5) return;
          let next = rand(POOL);
          if (next === span.textContent) next = rand(POOL);
          roll(i, next);
        });
      }, 85);

      tl = gsap.timeline();
      tl.from(root.current!.querySelector('.jumble'), { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0);

      // lock the name, left to right
      cells.forEach((cell, i) => {
        if (!isName(i)) return;
        tl!.call(() => {
          locked.add(i);
          spans[i].textContent = name[col(i)];
          cell.classList.add('is-locked');
          gsap.fromTo(spans[i], { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
        }, undefined, 1.1 + col(i) * 0.19);
      });

      // the rest settle into the square, rippling out from the name
      const allLocked = 1.1 + (COLS - 1) * 0.19 + 0.35;
      cells.forEach((cell, i) => {
        if (isName(i)) return;
        tl!.call(() => {
          locked.add(i);
          spans[i].textContent = SETTLED[row(i)][col(i)];
          cell.classList.add('is-settled');
          gsap.fromTo(spans[i], { yPercent: -30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
        }, undefined, allLocked + Math.abs(row(i) - NAME_ROW) * 0.12 + col(i) * 0.05);
      });
      const settled = allLocked + 2 * 0.12 + (COLS - 1) * 0.05 + 0.4;
      tl.call(() => clearInterval(tick), undefined, settled);

      // then the whole mark eases down to its resting size
      tl.to(jumble, { scale: restScale, duration: 1.3, ease: 'power3.inOut' }, settled + 0.35);
      tl.call(finish, undefined, settled + 0.9);
    };

    // wait for fonts (max 1.2s) so letters never swap typeface mid-roll
    let started = false;
    const start = () => { if (!started) { started = true; if (awayFromTop()) settleNow(); else play(); } };
    document.fonts?.ready.then(start);
    const fallback = setTimeout(start, 1200);

    // over a dark photo the header switches to plain white (the paper-page inversion goes murky)
    if (hero.image && hero.imageTone === 'dark') {
      const header = document.querySelector('.site-header');
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top+=80',
        toggleClass: header ? { targets: header, className: 'site-header--on-image' } : undefined,
      });
    }

    if (hero.replayOnReturn) {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom 40%', onEnterBack: play });
    }

    return () => { clearInterval(tick); clearTimeout(fallback); };
  }, { scope: root });

  return (
    <section ref={root} className={`hero hero--${hero.align}${hero.image ? (hero.imageTone === 'dark' ? ' hero--image' : ' hero--image-light') : ''}`} id="top" aria-label="Intro">
      <div className="hero__media" aria-hidden="true">
        {hero.image ? (
          <picture>
            {hero.imageMobile && <source media="(max-width: 720px)" srcSet={hero.imageMobile} />}
            <img src={hero.image} alt="" fetchPriority="high" style={{ '--hero-pos': hero.imagePosition } as React.CSSProperties} />
          </picture>
        ) : <HeroAvatar />}
      </div>

      <h1 className="sr-only">{hero.word}</h1>

      <div className="hero__stage" style={{ '--name-row': NAME_ROW } as React.CSSProperties}>
        <div className="jumble" aria-hidden="true">
          {Array.from({ length: ROWS * COLS }, (_, i) => (
            <div className="jumble__cell" key={i}><span /></div>
          ))}
        </div>
      </div>

      <ul className="hero__foot mono">
        {hero.footer.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
