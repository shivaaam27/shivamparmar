'use client';

import { useRef } from 'react';
import { hero } from '@/lib/content';
import { gsap, useGSAP, POOL, rand, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

import HeroAvatar from './HeroAvatar';

const ROWS = 5;
const NAME_ROW = 2; // zero-based centre row
const COLS = hero.word.length;

/** Where every letter comes to rest: EST on top, FABRA on row 2, LABS where "IVAM" sat, the year along the bottom. */
const SETTLED = ['ESTLRB', 'FABRAS', 'BRLABS', 'SLAFBR', 'AB2026'];
const FABRA = [6, 7, 8, 9, 10];
const LABS = [14, 15, 16, 17];
const BRAND = [...FABRA, ...LABS];
/** How small the grid shrinks while it turns into the logo. */
const REST_SCALE = { desktop: 0.62, phone: 0.8 };
/** Tile order for the build and the loader: up the stem, across the top, the middle arm, the sage tile last. */
const TILE_ORDER = [0, 1, 2, 3, 4, 5];

/**
 * The letter grid rolls; the name flashes in faintly, then FABRA and LABS lock and the rest settle.
 * As the grid shrinks, the grey letters fade, FABRA and LABS glide into one line, the mark builds
 * on their left, and the mark then becomes a slow loader.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const cells = gsap.utils.toArray<HTMLElement>('.jumble__cell', el);
    const spans = cells.map((c) => c.firstElementChild as HTMLElement);
    const html = document.documentElement;
    const name = hero.word;
    const stage = el.querySelector<HTMLElement>('.hero__stage')!;
    const jumble = el.querySelector<HTMLElement>('.jumble')!;
    const lock = el.querySelector<HTMLElement>('.hero__lock')!;
    const word = lock.querySelector<HTMLElement>('.hero__lock-word')!;
    const letters = gsap.utils.toArray<HTMLElement>('.hero__lock-word i', el);
    const tiles = gsap.utils.toArray<SVGRectElement>('.hero__mark rect', el);

    const col = (i: number) => i % COLS;
    const row = (i: number) => Math.floor(i / COLS);
    const finish = () => html.classList.add('intro-done');
    const restScale = () => (window.matchMedia('(max-width: 720px)').matches ? REST_SCALE.phone : REST_SCALE.desktop);

    let loader: gsap.core.Timeline | undefined;
    const startLoader = () => {
      loader?.kill();
      if (prefersReducedMotion()) return;
      const ink = getComputedStyle(lock).color;
      loader = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 1.6 });
      TILE_ORDER.forEach((t, n) => {
        if (tiles[t].classList.contains('is-lit')) return;
        loader!.to(tiles[t], { keyframes: [{ fill: '#4F7A5A', duration: 0.35 }, { fill: ink, duration: 0.55 }], ease: 'sine.inOut' }, n * 0.16);
      });
    };

    // the finished logo, straight away (no intro)
    const settleNow = () => {
      gsap.set(jumble, { autoAlpha: 0 });
      gsap.set(lock, { autoAlpha: 1 });
      gsap.set(word, { visibility: 'visible' });
      gsap.set(tiles, { opacity: 1, clearProps: 'transform' });
      finish();
      startLoader();
    };
    // a refresh part-way down the page (or a link to #work) skips the intro
    const awayFromTop = () => window.scrollY > window.innerHeight * 0.5 || (location.hash && location.hash !== '#top');

    if (prefersReducedMotion() || awayFromTop()) { settleNow(); return; }

    let tick: ReturnType<typeof setInterval> | undefined;
    let tl: gsap.core.Timeline | undefined;
    let flies: HTMLElement[] = [];

    const morph = () => {
      // measure where each brand letter lands in the final lockup
      gsap.set(lock, { autoAlpha: 1 });
      gsap.set(word, { visibility: 'hidden' });
      const box = stage.getBoundingClientRect();
      const targetSize = parseFloat(getComputedStyle(word).fontSize);
      flies = BRAND.map((ci, n) => {
        const s0 = spans[ci], src = s0.getBoundingClientRect(), dst = letters[n].getBoundingClientRect(), cs = getComputedStyle(s0);
        const f = document.createElement('span');
        f.className = 'hero__fly';
        f.textContent = s0.textContent;
        Object.assign(f.style, { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, color: cs.color });
        stage.appendChild(f);
        const r0 = f.getBoundingClientRect();
        f.style.left = `${src.left - box.left + (src.width - r0.width) / 2}px`;
        f.style.top = `${src.top - box.top + (src.height - r0.height) / 2}px`;
        gsap.to(f, {
          x: dst.left + dst.width / 2 - (src.left + src.width / 2),
          y: dst.top + dst.height / 2 - (src.top + src.height / 2),
          scale: targetSize / parseFloat(cs.fontSize),
          duration: 1.3, delay: n * 0.035, ease: 'power3.inOut',
        });
        return f;
      });
      gsap.set(BRAND.map((i) => cells[i]), { opacity: 0 });
      // the grid shrinks as it always has, and the grey letters fade out during the shrink
      gsap.to(jumble, { scale: restScale(), duration: 1.3, ease: 'power3.inOut' });
      gsap.to(cells.filter((_, i) => !BRAND.includes(i)), { opacity: 0, filter: 'blur(4px)', duration: 0.85, delay: 0.45, ease: 'power2.inOut', stagger: { each: 0.02, from: 'center' } });
      // the mark builds on the left while the letters travel; the sage tile arrives last
      tiles.forEach((t, n) => {
        const lit = t.classList.contains('is-lit');
        gsap.fromTo(t, lit ? { opacity: 0, x: 9, y: -9, scale: 0.5 } : { opacity: 0, y: 6, scale: 0.4 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: lit ? 0.75 : 0.5, delay: 0.7 + n * 0.09, ease: lit ? 'back.out(2.2)' : 'power3.out', transformOrigin: '50% 50%' });
      });
      gsap.delayedCall(1.7, () => {
        gsap.set(word, { visibility: 'visible' });
        flies.forEach((f) => f.remove());
        flies = [];
        gsap.set(jumble, { autoAlpha: 0 });
        finish();
        startLoader();
      });
    };

    const play = () => {
      tl?.kill(); loader?.kill(); clearInterval(tick);
      flies.forEach((f) => f.remove()); flies = [];
      html.classList.remove('intro-done');
      const locked = new Set<number>();

      cells.forEach((cell, i) => {
        cell.classList.remove('is-locked', 'is-labs', 'is-name', 'is-settled');
        spans[i].textContent = rand(POOL);
      });
      gsap.set(cells, { opacity: 1, filter: 'none' });
      gsap.set(jumble, { scale: 1, autoAlpha: 1 });
      gsap.set(lock, { autoAlpha: 0 });
      gsap.set(tiles, { opacity: 0 });

      const roll = (i: number, letter: string) => {
        spans[i].textContent = letter;
        gsap.fromTo(spans[i], { yPercent: 45, opacity: 0.35 }, { yPercent: 0, opacity: 1, duration: 0.15, ease: 'power3.out' });
      };
      const lockAt = (i: number, letter: string, cls: string) => {
        locked.add(i);
        spans[i].textContent = letter;
        cells[i].classList.add(cls);
        gsap.fromTo(spans[i], { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
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
      tl.fromTo(jumble, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0);

      // the name: quick and subtle, then it rolls away again
      const nameRow = cells.map((_, i) => i).filter((i) => row(i) === NAME_ROW);
      nameRow.forEach((i) => tl!.call(() => lockAt(i, name[col(i)], 'is-name'), undefined, 0.8 + col(i) * 0.055));
      tl.call(() => nameRow.forEach((i) => { locked.delete(i); cells[i].classList.remove('is-name'); }), undefined, 1.8);

      // the brand: FABRA on row 2, LABS where "IVAM" sat
      FABRA.forEach((i, n) => tl!.call(() => lockAt(i, 'FABRA'[n], 'is-locked'), undefined, 2.25 + n * 0.13));
      LABS.forEach((i, n) => tl!.call(() => lockAt(i, 'LABS'[n], 'is-labs'), undefined, 2.25 + (5 + n) * 0.13));

      // everything else settles quietly, rippling out from the brand
      const brandDone = 2.25 + 9 * 0.13 + 0.25;
      cells.forEach((cell, i) => {
        if (BRAND.includes(i)) return;
        tl!.call(() => {
          locked.add(i);
          spans[i].textContent = SETTLED[row(i)][col(i)];
          cell.classList.add('is-settled');
          gsap.fromTo(spans[i], { yPercent: -30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
        }, undefined, brandDone + Math.abs(row(i) - 1.5) * 0.1 + col(i) * 0.04);
      });
      const settled = brandDone + 2.5 * 0.1 + (COLS - 1) * 0.04 + 0.4;
      tl.call(() => clearInterval(tick), undefined, settled);

      // then the shrink, during which the grid turns into the logo
      tl.call(morph, undefined, settled + 0.5);
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

    return () => { clearInterval(tick); clearTimeout(fallback); loader?.kill(); flies.forEach((f) => f.remove()); };
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

      <h1 className="sr-only">Fabra Labs</h1>

      <div className="hero__stage" style={{ '--name-row': NAME_ROW } as React.CSSProperties}>
        <div className="jumble" aria-hidden="true">
          {Array.from({ length: ROWS * COLS }, (_, i) => (
            <div className="jumble__cell" key={i}><span /></div>
          ))}
        </div>
        <div className="hero__lock" aria-hidden="true">
          <svg className="hero__mark" viewBox="0 0 64 64">
            <rect x="0" y="46" width="18" height="18" rx="4.5" />
            <rect x="0" y="23" width="18" height="18" rx="4.5" />
            <rect x="0" y="0" width="18" height="18" rx="4.5" />
            <rect x="23" y="0" width="18" height="18" rx="4.5" />
            <rect x="23" y="23" width="18" height="18" rx="4.5" />
            <rect className="is-lit" x="46" y="0" width="18" height="18" rx="4.5" />
          </svg>
          <div className="hero__lock-word">
            <b>{[...'FABRA'].map((l, i) => <i key={i}>{l}</i>)}</b>
            <span>{[...'LABS'].map((l, i) => <i key={i}>{l}</i>)}</span>
          </div>
        </div>
      </div>

      <ul className="hero__foot mono">
        {hero.footer.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
