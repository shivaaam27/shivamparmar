'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { awakeNow } from './HeroAvatar';

/**
 * Blobby's journey down the home page, after the intro. One moonstone circle on a fixed layer behind
 * the content, recomputed from the scroll every frame (so every step reverses when you scroll back):
 *   A  from beside "Read more about me" it grows, its bottom edge flowing down, into a broad dome
 *      hanging behind the Work header (its top dissolving into the page, its eyes settling on the right)
 *   B  past Work it flattens out and slides down behind the picture strip until it's gone
 *   C  it pops up again, small, just after "Got something worth making?"
 *   D  into the footer it swells into a light dome rising behind SHIVAM, eyes just above the name
 */
type Circle = { cx: number; cy: number; r: number; ry?: number };   // ry: an ellipse's height radius
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(Math.max(a, 1)), Math.log(Math.max(b, 1)), t));
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const backOut = (t: number) => { const c = 1.6; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
/** where along the scroll a section is: 0 when its top is at `from` (fraction of the screen), 1 at `to` */
const along = (top: number, H: number, from: number, to: number) => clamp01((H * from - top) / (H * from - H * to));

export default function BlobbyJourney() {
  const layer = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current, eyes = face.current;
    if (!el || !eyes || prefersReducedMotion()) return;
    el.classList.toggle('is-night', !awakeNow());
    const root = document.documentElement;
    let raf = 0, px = 0, py = 0, lx = 0, ly = 0;
    const onPointer = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const q = (s: string) => document.querySelector<HTMLElement>(s);
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const W = window.innerWidth, H = window.innerHeight;
      const orbBody = q('.about__orb-body'), orbFace = q('.about__orb-face');
      const head = q('.work__head'), reel = q('.work__reel'), contact = q('.contact h2'), foot = q('.site-footer__name');
      if (!orbBody || !head || !reel || !contact || !foot) return;
      const headR = head.getBoundingClientRect(), reelR = reel.getBoundingClientRect();
      const cR = contact.getBoundingClientRect(), fR = foot.getBoundingClientRect();

      const a = along(headR.top, H, 0.95, 0.3);          // read more → Work
      const b = along(reelR.top, H, 0.62, -0.25);        // past Work: a long, gentle exit
      const c = along(cR.top, H, 0.92, 0.55);            // Contact
      // footer: it finishes as you reach the very end of the page, however short the screen
      const left = document.documentElement.scrollHeight - (window.scrollY + H);
      const endFrac = (fR.top - left) / H;                // where the name will sit at the bottom of the page
      const dTo = Math.max(0.42, endFrac - 0.01), dFrom = Math.max(1, dTo + 0.45);
      const d = along(fR.top, H, dFrom, dTo);

      // ---- the circles it travels between
      const o = orbBody.getBoundingClientRect();
      const orb: Circle = { cx: o.left + o.width / 2, cy: o.top + o.height / 2, r: Math.max(o.width / 2, 6) };
      const domeR = W * 1.6, domeBottom = reelR.top - 18;               // broad and gentle, resting on the strip
      // Contact: Blobby attached to the right edge of the screen (like the corner Blobby on the About page),
      // a little more than half of it showing, level with the section
      const edgeR = Math.max(64, Math.min(W * 0.085, H * 0.16, 132));
      const small: Circle = { cx: W + edgeR * 0.12, cy: Math.min(Math.max(cR.top + cR.height * 0.55, H * 0.3), H * 0.62), r: edgeR };
      // the footer dome: a hero-like rise behind the name
      // a wide soft blob behind the name, its top a little above the letters
      const nameH = fR.height, footRx = W * 0.62, footRy = Math.max(nameH * 1.7, 140), footTop = fR.top - Math.max(48, nameH * 0.55);

      let circ: Circle | null = null, phase = '';
      let light = { x: 0, y: 0, s: 0 }, cut = 0, fadeA = -H * 2, fadeB = -H * 2 + 1, alpha = 1, eyeA = 1;
      let eye = { x: 0, y: 0, w: 10 };
      const smallLight = (k: Circle) => ({ x: k.cx - k.r * 0.32, y: k.cy - k.r * 0.68, s: k.r * 2.14 });

      if (d > 0) {
        phase = 'footer';
        const e = inOut(d);
        // a wide, soft blob: much broader than it is tall, spreading out to the left and right
        const rx = logLerp(small.r, footRx, e), ry = logLerp(small.r, footRy, e);
        // it never rises over the contact details: as the morph begins it slips down below the last line
        // of text (sliding along the edge), and only then spreads out into the footer blob
        const textEnd = Math.max(q('.contact__cols')?.getBoundingClientRect().bottom ?? 0, q('.contact__mail')?.getBoundingClientRect().bottom ?? 0) + 14;
        const free = Math.max(lerp(small.cy - small.r, footTop, e), textEnd);
        const top = lerp(small.cy - small.r, free, clamp01(d * 4));
        circ = { cx: lerp(small.cx, W / 2, e), cy: top + ry, r: rx, ry };
        const sl = smallLight(small);
        light = { x: lerp(sl.x, W * 0.42, e), y: lerp(sl.y, footTop + footRy * 0.2, e), s: lerp(sl.s, footRx * 1.3, e) };
        alpha = lerp(1, 0.6, e);                                          // light enough to read SHIVAM through
        eye = { x: lerp(small.cx - small.r * 0.5, W / 2, e), y: lerp(small.cy - small.r * 0.2, footTop + (fR.top - footTop) * 0.55, e), w: lerp(small.r * 0.13, Math.max(10, nameH * 0.09), e) };
        eye.y = Math.max(eye.y, top + Math.min(ry * 0.4, 44));                 // the eyes stay inside it as it slides down
      } else if (c > 0) {
        phase = 'contact';
        // it slowly grows out of the edge as you arrive, then stays put while you read
        const e = 1 - (1 - c) ** 3;
        const r = small.r * Math.max(0.02, e);
        circ = { cx: W + r * 0.12 + (1 - e) * small.r * 0.4, cy: small.cy, r };
        light = smallLight(circ);
        // its face sits in the part that shows, looking into the page
        eye = { x: circ.cx - r * 0.5, y: small.cy - r * 0.2, w: r * 0.13 };
        eyeA = clamp01(c * 1.6);
      } else if (b > 0) {
        phase = 'away';
        const e = inOut(b);
        const r = domeR * (1 + e * 2);                                      // flattening out…
        const bottom = lerp(domeBottom, reelR.top + 70, e);                 // …and lowering behind the strip
        circ = { cx: W / 2, cy: bottom - r, r };
        light = { x: W * 0.42, y: bottom - 30, s: W * 0.95 };
        cut = Math.max(0, H - reelR.top);
        // its soft top stays a fixed depth above its lowest point, so it fades away gradually
        fadeA = bottom - 300; fadeB = bottom - 110;
        alpha = 1 - e * 0.9;
        eye = { x: W * 0.72, y: bottom - 64, w: 17 }; eyeA = 1 - clamp01(b * 1.8);
      } else if (a > 0) {
        phase = 'arrive';
        const e = inOut(a);
        const bottom = lerp(orb.cy + orb.r, domeBottom, e);
        const r = logLerp(orb.r, domeR, e);
        circ = { cx: lerp(orb.cx, W / 2, e), cy: bottom - r, r };
        const sl = smallLight(orb);
        light = { x: lerp(sl.x, W * 0.42, e), y: lerp(sl.y, bottom - 30, e), s: lerp(sl.s, W * 0.95, e) };
        cut = Math.max(0, H - reelR.top);
        // it only ever grows downward: nothing shows above the link line, and that soft edge moves up
        // to the dome's final fade as it settles, so it never washes over the intro's text
        fadeA = lerp(orb.cy - orb.r - 2, headR.top - 170, e); fadeB = lerp(orb.cy - orb.r + 4, headR.top + 20, e);
        const of = orbFace?.getBoundingClientRect();
        const ow = (orbFace?.firstElementChild as HTMLElement | null)?.offsetWidth ?? orb.r * 0.26;
        eye = { x: lerp(of ? of.left + of.width / 2 : orb.cx, W * 0.72, e), y: lerp(of ? of.top + of.height / 2 : orb.cy, bottom - 64, e), w: lerp(ow, 17, e) };
      }

      // the small Blobby by the link steps aside the moment this one takes over (and back)
      root.style.setProperty('--blobby-away', phase ? '1' : '0');
      el.style.opacity = phase ? '1' : '0';
      if (!circ) return;
      el.style.setProperty('--cx', `${circ.cx}px`); el.style.setProperty('--cy', `${circ.cy}px`); el.style.setProperty('--r', `${circ.r}px`); el.style.setProperty('--ry', `${circ.ry ?? circ.r}px`);
      el.style.setProperty('--lx', `${light.x}px`); el.style.setProperty('--ly', `${light.y}px`); el.style.setProperty('--ls', `${light.s}px`);
      el.style.setProperty('--m0', `${fadeA}px`); el.style.setProperty('--m1', `${fadeB}px`);
      el.style.setProperty('--cut', `${cut}px`); el.style.setProperty('--alpha', String(alpha));
      // eyes: placed, sized, and turned toward the pointer
      const dx = px - eye.x, dy = py - eye.y, dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 300);
      lx += ((dx / dist) * k * eye.w * 0.55 - lx) * 0.12; ly += ((dy / dist) * k * eye.w * 0.4 - ly) * 0.12;
      eyes.style.setProperty('--ex', `${eye.x}px`); eyes.style.setProperty('--ey', `${eye.y}px`); eyes.style.setProperty('--ew', `${eye.w}px`);
      eyes.style.setProperty('--look', `${lx.toFixed(2)}px ${ly.toFixed(2)}px`);
      eyes.style.opacity = String(eyeA);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onPointer); root.style.removeProperty('--blobby-away'); };
  }, []);

  return (
    <div className="journey" ref={layer} aria-hidden="true">
      <div className="journey__eyes" ref={face}><i /><i /></div>
    </div>
  );
}
