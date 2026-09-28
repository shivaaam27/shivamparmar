'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

/** Letters every jumble/scramble draws from. */
export const POOL = 'SHIVAM';

export const rand = (s: string) => s[Math.floor(Math.random() * s.length)];

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Decode an element's text from random SHIVAM letters, left to right. */
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
        out += i < settled || final[i] === ' ' ? final[i] : rand(POOL);
      }
      el.textContent = out;
    },
    onComplete: () => { el.textContent = final; },
  });
}
