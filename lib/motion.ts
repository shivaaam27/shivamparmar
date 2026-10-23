'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

/** Letters every jumble/scramble draws from. */
export const POOL = 'SHIVAM';

/** Letters the footer name decodes from. */
const SCRAMBLE_POOL = 'SHIVOLAB';

export const rand = (s: string) => s[Math.floor(Math.random() * s.length)];

/**
 * One scroll pace for the whole site (docs/SITE.md, "Scroll pace"). Every held scene is as tall as its timeline
 * needs at this pace, so a change on screen always takes the same scroll, and the same smoothing (scrub) gives every
 * scene the same weight. Raise screensPerUnit for slower scenes everywhere, lower it for faster.
 */
export const PACE = { screensPerUnit: 0.5, scrub: 0.8 };

/**
 * Makes a held scene the right height for its timeline at PACE. `rest` is how many screens of the element the
 * timeline does not scroll through (its own held screen, and the screen the next section overlaps).
 */
export function fitScene(el: HTMLElement, tl: gsap.core.Timeline, rest: number) {
  el.style.height = `${((tl.duration() * PACE.screensPerUnit) + rest) * 100}vh`;
  ScrollTrigger.refresh();
}

/** How many screens of scrolling the cream page takes to rise over the home page's About scene. */
export const RISE = 2;

/**
 * The rounded card that grows to the full width (the cream page, the contact block): the clip it has at `g` (0 to 1).
 * Written straight onto the one element. It used to be a `--g` custom property read by the clip-path in CSS, but a
 * custom property is inherited, so every frame of the scroll the browser re-styled everything inside the card (the whole
 * wall of work and the products): 25 s of style work in one test scroll, frames of 100 ms on a phone. Same look, now cheap.
 */
export const growClip = (g: number) => {
  const k = 1 - g;
  return `inset(0 ${(k * 4).toFixed(2)}% 0 ${(k * 4).toFixed(2)}% round ${(k * 40).toFixed(1)}px ${(k * 40).toFixed(1)}px 0 0)`;
};

/** Touch screens scroll by themselves, ahead of the page's script, so a long trail behind the finger feels like a bounce. */
export const onTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Decode an element's text from random brand letters, left to right. */
export function scramble(el: HTMLElement, duration = 0.7) {
  const final = el.dataset.text ?? el.textContent?.trim() ?? '';
  el.dataset.text = final;
  if (prefersReducedMotion()) return;

  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const settled = Math.floor(state.p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        out += i < settled || final[i] === ' ' ? final[i] : rand(SCRAMBLE_POOL);
      }
      el.textContent = out;
    },
    onComplete: () => { el.textContent = final; },
  });
}
