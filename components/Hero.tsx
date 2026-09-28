'use client';

import { useRef } from 'react';
import { hero } from '@/lib/content';
import { gsap, useGSAP, POOL, rand, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

const ROWS = 5;
const NAME_ROW = 2; // zero-based centre row
const COLS = hero.word.length;

/**
 * A grid of jumbled letters rolls; the centre row locks into the name
 * left to right, then everything else fades away. Plays once per load.
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

    if (prefersReducedMotion()) {
      cells.forEach((cell, i) => {
        if (isName(i)) { spans[i].textContent = name[col(i)]; cell.classList.add('is-locked'); }
        else gsap.set(cell, { opacity: 0 });
      });
      finish();
      return;
    }

    let tick: ReturnType<typeof setInterval> | undefined;
    let tl: gsap.core.Timeline | undefined;

    const play = () => {
      tl?.kill();
      clearInterval(tick);
      html.classList.remove('intro-done');
      const locked = new Set<number>();

      cells.forEach((cell, i) => {
        cell.classList.remove('is-locked');
        spans[i].textContent = rand(POOL);
      });
      gsap.set(cells, { opacity: 1, filter: 'blur(0px)', y: 0 });

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

      // stop and fade the rest, outward from the name
      const allLocked = 1.1 + (COLS - 1) * 0.19 + 0.35;
      tl.call(() => clearInterval(tick), undefined, allLocked);
      cells.forEach((cell, i) => {
        if (isName(i)) return;
        const distance = Math.abs(row(i) - NAME_ROW);
        tl!.to(cell, {
          opacity: 0,
          filter: 'blur(6px)',
          yPercent: row(i) < NAME_ROW ? -12 : 12,
          duration: 0.75,
          ease: 'power2.inOut',
        }, allLocked + distance * 0.11 + Math.random() * 0.16);
      });
      tl.call(finish, undefined, allLocked + 0.65);
    };

    // wait for fonts (max 1.2s) so letters never swap typeface mid-roll
    let started = false;
    const start = () => { if (!started) { started = true; play(); } };
    document.fonts?.ready.then(start);
    const fallback = setTimeout(start, 1200);

    if (hero.replayOnReturn) {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom 40%', onEnterBack: play });
    }

    return () => { clearInterval(tick); clearTimeout(fallback); };
  }, { scope: root });

  return (
    <section ref={root} className={`hero${hero.image ? ' hero--image' : ''}`} id="top" aria-label="Intro">
      <div className="hero__media" aria-hidden="true">
        {hero.image && <img src={hero.image} alt="" />}
      </div>

      <h1 className="sr-only">{hero.word}</h1>

      <div className="hero__stage" style={{ '--name-row': NAME_ROW } as React.CSSProperties}>
        <div className="jumble" aria-hidden="true">
          {Array.from({ length: ROWS * COLS }, (_, i) => (
            <div className="jumble__cell" key={i}><span /></div>
          ))}
        </div>
        <p className="hero__descriptor mono">
          {hero.descriptor[0]}<br />{hero.descriptor[1]}
        </p>
      </div>

      <ul className="hero__foot mono">
        {hero.footer.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
