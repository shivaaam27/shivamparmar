'use client';

import { useRef } from 'react';
import { hero } from '@/lib/content';
import { gsap, useGSAP, POOL, rand, prefersReducedMotion } from '@/lib/motion';

/*
 * The logo intro, kept exactly as it was:
 * the letter grid rolls, the name flashes in, SHIVO and LABS lock, the rest settles, the grid shrinks and
 * turns into the logo, and the mark becomes a slow loader.
 */
const ROWS = 5;
const NAME_ROW = 2;
const COLS = hero.word.length;
const SETTLED = ['ESTOHI', 'SHIVOL', 'IHLABS', 'SLOHVI', 'VO2026'];
const SHIVO = [6, 7, 8, 9, 10];
const LABS = [14, 15, 16, 17];
const BRAND = [...SHIVO, ...LABS];
const REST_SCALE = 0.62;
const TILE_ORDER = [0, 1, 2, 3, 4, 5];

export default function HeroLogo({ onDone, delay = 0 }: { onDone?: () => void; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const cells = gsap.utils.toArray<HTMLElement>('.v2-jumble__cell', el);
    const spans = cells.map((c) => c.firstElementChild as HTMLElement);
    const jumble = el.querySelector<HTMLElement>('.v2-jumble')!;
    const lock = el.querySelector<HTMLElement>('.v2-lock')!;
    const word = lock.querySelector<HTMLElement>('.v2-lock__word')!;
    const letters = gsap.utils.toArray<HTMLElement>('.v2-lock__word i', el);
    const tiles = gsap.utils.toArray<SVGRectElement>('.v2-lock__mark rect', el);
    const name = hero.word;

    const col = (i: number) => i % COLS;
    const row = (i: number) => Math.floor(i / COLS);
    let doneSent = false;
    const finish = () => { el.classList.add('is-done'); if (!doneSent) { doneSent = true; onDone?.(); } };

    let loader: gsap.core.Timeline | undefined;
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) loader?.resume(); else loader?.pause(); });
    io.observe(el);
    const startLoader = () => {
      loader?.kill();
      if (prefersReducedMotion()) return;
      const ink = getComputedStyle(lock).color;
      loader = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 1.6 });
      TILE_ORDER.forEach((t, n) => {
        if (tiles[t].classList.contains('is-lit')) return;
        loader!.to(tiles[t], { keyframes: [{ fill: '#4F7A5A', duration: 0.35 }, { fill: ink, duration: 0.55 }], ease: 'sine.inOut' }, n * 0.16);
      });
      if (!onScreen) loader.pause();
    };

    const settleNow = () => {
      gsap.set(jumble, { autoAlpha: 0 });
      gsap.set(lock, { autoAlpha: 1 });
      gsap.set(word, { visibility: 'visible' });
      gsap.set(tiles, { opacity: 1, clearProps: 'transform' });
      finish();
      startLoader();
    };
    const awayFromTop = () => window.scrollY > window.innerHeight * 0.5 || (location.hash && location.hash !== '#top');
    if (prefersReducedMotion() || awayFromTop()) { settleNow(); return () => { loader?.kill(); io.disconnect(); }; }

    let tick: ReturnType<typeof setInterval> | undefined;
    let tl: gsap.core.Timeline | undefined;
    let flies: HTMLElement[] = [];

    const morph = () => {
      gsap.set(lock, { autoAlpha: 1 });
      gsap.set(word, { visibility: 'hidden' });
      const box = el.getBoundingClientRect();
      const targetSize = parseFloat(getComputedStyle(word).fontSize);
      flies = BRAND.map((ci, n) => {
        const s0 = spans[ci], src = s0.getBoundingClientRect(), dst = letters[n].getBoundingClientRect(), cs = getComputedStyle(s0);
        const f = document.createElement('span');
        f.className = 'v2-fly';
        f.textContent = s0.textContent;
        Object.assign(f.style, { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, color: cs.color });
        el.appendChild(f);
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
      gsap.to(jumble, { scale: REST_SCALE, duration: 1.3, ease: 'power3.inOut' });
      gsap.to(cells.filter((_, i) => !BRAND.includes(i)), { opacity: 0, filter: 'blur(4px)', duration: 0.85, delay: 0.45, ease: 'power2.inOut', stagger: { each: 0.02, from: 'center' } });
      tiles.forEach((t, n) => {
        const lit = t.classList.contains('is-lit');
        gsap.fromTo(t, lit ? { opacity: 0, x: -9, y: -9, scale: 0.5 } : { opacity: 0, y: 6, scale: 0.4 },
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
      const locked = new Set<number>();
      cells.forEach((cell, i) => { spans[i].textContent = rand(POOL); });
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
      const nameRow = cells.map((_, i) => i).filter((i) => row(i) === NAME_ROW);
      nameRow.forEach((i) => tl!.call(() => lockAt(i, name[col(i)], 'is-name'), undefined, 0.8 + col(i) * 0.055));
      tl.call(() => nameRow.forEach((i) => { locked.delete(i); cells[i].classList.remove('is-name'); }), undefined, 1.8);
      SHIVO.forEach((i, n) => tl!.call(() => lockAt(i, 'SHIVO'[n], 'is-locked'), undefined, 2.25 + n * 0.13));
      LABS.forEach((i, n) => tl!.call(() => lockAt(i, 'LABS'[n], 'is-labs'), undefined, 2.25 + (5 + n) * 0.13));
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
      tl.call(morph, undefined, settled + 0.5);
    };

    // wait for fonts (max 1.2s) so letters never swap typeface mid-roll, and for the card to grow in
    let started = false;
    let wait: gsap.core.Tween | undefined;
    const start = () => { if (started) return; started = true; wait = gsap.delayedCall(delay, () => (awayFromTop() ? settleNow() : play())); };
    document.fonts?.ready.then(start);
    const fallback = setTimeout(start, 1200);

    return () => { clearInterval(tick); clearTimeout(fallback); wait?.kill(); tl?.kill(); loader?.kill(); io.disconnect(); flies.forEach((f) => f.remove()); };
  }, { scope: root });

  return (
    <div ref={root} className="v2-hlogo">
      <h1 className="sr-only">Shivo Labs</h1>
      <div className="v2-jumble" aria-hidden="true">
        {Array.from({ length: ROWS * COLS }, (_, i) => <div className="v2-jumble__cell" key={i}><span /></div>)}
      </div>
      <div className="v2-lock" aria-hidden="true">
        <svg className="v2-lock__mark" viewBox="0 0 64 64">
          <g transform="rotate(15 32 32)">
            <rect x="0" y="46" width="18" height="18" rx="4.5" />
            <rect x="46" y="0" width="18" height="18" rx="4.5" />
            <rect x="23" y="23" width="18" height="18" rx="4.5" />
            <rect x="23" y="0" width="18" height="18" rx="4.5" />
            <rect x="0" y="23" width="18" height="18" rx="4.5" />
            <rect className="is-lit" x="0" y="0" width="18" height="18" rx="4.5" />
          </g>
        </svg>
        <div className="v2-lock__word">
          <b>{[...'SHIVO'].map((l, i) => <i key={i}>{l}</i>)}</b>
          <span>{[...'LABS'].map((l, i) => <i key={i}>{l}</i>)}</span>
        </div>
      </div>
    </div>
  );
}
