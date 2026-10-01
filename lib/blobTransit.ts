'use client';

import { gsap } from '@/lib/motion';

/**
 * Blobby's page transition. On the home page it swells from where it sits until it fills the screen,
 * face and all, like a loading screen; the next page opens underneath, finds it waiting and shrinks
 * it into its own spot there. The layer lives on <body>, so it survives the client-side navigation.
 *
 * The layer is one circle (cx, cy, r). Its moonstone shading is drawn around that circle, not the
 * screen, so it looks like Blobby at every size (lit from the upper left), never a flat grey disc.
 */
const EYE = 40;   // eye width in the full-screen face, in px; everything else scales from it
type Circle = { cx: number; cy: number; r: number };

function paint(el: HTMLElement, c: Circle) {
  el.style.clipPath = `circle(${c.r}px at ${c.cx}px ${c.cy}px)`;
  el.style.setProperty('--cx', `${c.cx}px`);
  el.style.setProperty('--cy', `${c.cy}px`);
  el.style.setProperty('--r', `${c.r}px`);
}

export function blobGrow(from: HTMLElement, night: boolean, done: () => void) {
  const rect = from.getBoundingClientRect();
  const W = window.innerWidth, H = window.innerHeight;
  const c: Circle = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, r: rect.width / 2 };

  const el = document.createElement('div');
  el.className = `blob-transit${night ? ' is-night' : ''}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="blob-transit__face"><i></i><i></i></span>';
  document.body.appendChild(el);
  const face = el.firstElementChild as HTMLElement;
  const draw = () => paint(el, c);
  draw();

  gsap.set(face, { x: c.cx, y: c.cy - rect.height * 0.1, scale: (0.13 * rect.width) / EYE });
  gsap.timeline({ onComplete: done })
    // a tiny crouch before it swells
    .to(c, { r: rect.width * 0.4, duration: 0.14, ease: 'power2.in', onUpdate: draw })
    .to(c, { cx: W / 2, cy: H / 2, r: Math.hypot(W, H) * 0.56, duration: 0.8, ease: 'power3.inOut', onUpdate: draw })
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
  const W = window.innerWidth, H = window.innerHeight;
  const c: Circle = { cx: W / 2, cy: H / 2, r: Math.hypot(W, H) * 0.56 };
  const o = orb.getBoundingClientRect();
  const f = faceEl.getBoundingClientRect();
  const eye = (faceEl.firstElementChild as HTMLElement | null)?.offsetWidth ?? EYE;
  const draw = () => paint(el, c);
  draw();
  gsap.timeline({ delay: 0.25, onComplete: () => el.remove() })
    .to(c, { cx: o.left + o.width / 2, cy: o.top + o.height / 2, r: orb.offsetWidth / 2, duration: 1, ease: 'power3.inOut', onUpdate: draw })
    .to(face, { x: f.left + f.width / 2, y: f.top + f.height / 2, scale: eye / EYE, rotation: rotate, duration: 1, ease: 'power3.inOut' }, '<')
    .call(onLanded)
    .to(el, { opacity: 0, duration: 0.4 });
  return true;
}
