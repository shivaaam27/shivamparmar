'use client';

import { gsap } from '@/lib/motion';

/**
 * Blobby's page transition. On the home page it swells from where it sits until it fills the screen,
 * face and all, like a loading screen; the next page opens underneath, finds it waiting and shrinks
 * it into its own spot there. The layer lives on <body>, so it survives the client-side navigation.
 */
const EYE = 40;   // eye width in the full-screen face, in px; everything else scales from it

export function blobGrow(from: HTMLElement, night: boolean, done: () => void) {
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const W = window.innerWidth, H = window.innerHeight;

  const el = document.createElement('div');
  el.className = `blob-transit${night ? ' is-night' : ''}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="blob-transit__face"><i></i><i></i></span>';
  document.body.appendChild(el);
  const face = el.firstElementChild as HTMLElement;

  gsap.set(el, { clipPath: `circle(${r.width / 2}px at ${cx}px ${cy}px)` });
  gsap.set(face, { x: cx, y: cy - r.height * 0.1, scale: (0.13 * r.width) / EYE });
  gsap.timeline({ onComplete: done })
    // a tiny crouch before it swells
    .to(el, { clipPath: `circle(${r.width * 0.4}px at ${cx}px ${cy}px)`, duration: 0.14, ease: 'power2.in' })
    .to(el, { clipPath: `circle(${Math.hypot(W, H) * 0.56}px at ${W / 2}px ${H / 2}px)`, duration: 0.8, ease: 'power3.inOut' })
    .to(face, { x: W / 2, y: H * 0.46, scale: 1, duration: 0.8, ease: 'power3.inOut' }, '<')
    .to({}, { duration: 0.12 });
}

/** On the new page: if Blobby arrived full-screen, shrink it into `orb` (and its face into `faceEl`). */
export function blobLand(orb: HTMLElement, faceEl: HTMLElement, rotate: number, onLanded: () => void) {
  const el = document.querySelector<HTMLElement>('.blob-transit');
  if (!el) return false;
  const face = el.firstElementChild as HTMLElement;
  // no spot for it on this screen (phones hide the corner Blobby): just let the screen clear
  if (!orb.offsetWidth) {
    gsap.to(el, { opacity: 0, duration: 0.5, delay: 0.25, onComplete: () => { el.remove(); onLanded(); } });
    return true;
  }
  const o = orb.getBoundingClientRect();
  const f = faceEl.getBoundingClientRect();
  const eye = (faceEl.firstElementChild as HTMLElement | null)?.offsetWidth ?? EYE;
  gsap.timeline({ delay: 0.25, onComplete: () => el.remove() })
    .to(el, { clipPath: `circle(${orb.offsetWidth / 2}px at ${o.left + o.width / 2}px ${o.top + o.height / 2}px)`, duration: 1, ease: 'power3.inOut' })
    .to(face, { x: f.left + f.width / 2, y: f.top + f.height / 2, scale: eye / EYE, rotation: rotate, duration: 1, ease: 'power3.inOut' }, '<')
    .call(onLanded)
    .to(el, { opacity: 0, duration: 0.4 });
  return true;
}
