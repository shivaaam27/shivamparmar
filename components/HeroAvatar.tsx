'use client';

import { useEffect, useRef, useState } from 'react';
import { hero } from '@/lib/content';
import { prefersReducedMotion } from '@/lib/motion';

/** Is it waking hours where Shivam is? (?avatar=awake / ?avatar=asleep overrides, for checking both looks.) */
export function awakeNow() {
  const force = new URLSearchParams(window.location.search).get('avatar');
  if (force === 'awake') return true;
  if (force === 'asleep') return false;
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: hero.avatar.timeZone }).format(Date.now()));
  return hour >= hero.avatar.wake && hour < hero.avatar.sleep;
}

/**
 * The light behind the name: a glowing orb with two eyes that follow the pointer
 * by day, and by night (off hours in Dar es Salaam) a grey orb asleep, breathing, with drifting z's.
 */
export default function HeroAvatar({ side = false }: { side?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [awake, setAwake] = useState<boolean | null>(null);

  // day or night, checked every minute
  useEffect(() => {
    const check = () => setAwake(awakeNow());
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  // scrolling away, the light sets: it sinks and fades, and its lower edge dissolves as the
  // hero's bottom comes into view, so the orb is never seen cut off by the next section
  useEffect(() => {
    const el = root.current;
    if (!el || side) return;   // beside the About index it simply stays
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = el.offsetHeight || window.innerHeight;
      const y = Math.max(0, window.scrollY);
      const p = Math.min(y / (h * 0.7), 1);
      el.style.setProperty('--fade', `${Math.min(y * 1.6, h)}px`);
      el.style.setProperty('--vis', String(1 - p));
      el.style.setProperty('--sink', `${p * h * 0.12}px`);
      // the words along the bottom of the hero leave with it
      el.closest<HTMLElement>('.hero')?.style.setProperty('--hero-vis', String(Math.max(0, 1 - p * 3)));
      // fully set: stop drawing the intro (it stays behind the page now); wake the eyes when back
      const hero = el.closest<HTMLElement>('.hero');
      const gone = p >= 1;
      // as the light sets, the eyes close gently (open again when you scroll back)
      el.classList.toggle('is-setting', p > 0.12);
      if (hero) hero.style.visibility = gone ? 'hidden' : '';
      if (gone !== (el.dataset.gone === '1')) {
        el.dataset.gone = gone ? '1' : '';
        if (!gone) window.dispatchEvent(new Event('avatar:back'));
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [side]);

  // beside the About index it's fixed in the corner: step aside when the page's end arrives
  useEffect(() => {
    const el = root.current;
    const end = side ? document.querySelector('.ab-end') ?? document.querySelector('.site-footer') : null;
    if (!el || !end) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-away', e.isIntersecting));
    io.observe(end);
    return () => io.disconnect();
  }, [side]);

  // eyes follow the pointer (eased), blink now and then; idle glances when the pointer is away
  useEffect(() => {
    const el = root.current;
    if (!el || !awake || prefersReducedMotion()) return;
    const face = el.querySelector<HTMLElement>('.avatar__face')!;
    const orb = el.querySelector<HTMLElement>('.avatar__orb')!;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, visible = true, lastMove = 0;

    const aim = (px: number, py: number) => {
      const r = face.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(d / 380, 1);           // far pointer = eyes at the rim
      tx = (dx / d) * reach; ty = (dy / d) * reach;
      lastMove = performance.now();
    };
    const onPointer = (e: PointerEvent) => aim(e.clientX, e.clientY);
    const onLeave = () => { lastMove = 0; };

    const frame = (t: number) => {
      // nobody pointing for a while: look around slowly on its own
      if (t - lastMove > 2500) { tx = Math.sin(t / 2300) * 0.55; ty = Math.sin(t / 3100) * 0.3; }
      x += (tx - x) * 0.09; y += (ty - y) * 0.09;
      const D = orb.offsetWidth;
      // the About blob is turned 45°: turn the look back so the eyes still point at the pointer
      const [lx, ly] = side ? [(x + y) * Math.SQRT1_2, (y - x) * Math.SQRT1_2] : [x, y];
      face.style.transform = `translate(${lx * D * 0.05}px, ${ly * D * 0.04}px)`;
      orb.style.setProperty('--lean-x', `${x * D * 0.008}px`);
      orb.style.setProperty('--lean-y', `${y * D * 0.008}px`);
      if (visible && !el.dataset.gone) raf = requestAnimationFrame(frame); else raf = 0;
    };
    const back = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };

    // blink: a quick close, sometimes twice
    let blinkT: ReturnType<typeof setTimeout>;
    const blink = () => {
      face.classList.add('is-blinking');
      setTimeout(() => face.classList.remove('is-blinking'), 140);
      if (Math.random() < 0.25) setTimeout(() => { face.classList.add('is-blinking'); setTimeout(() => face.classList.remove('is-blinking'), 130); }, 300);
      blinkT = setTimeout(blink, 2600 + Math.random() * 3800);
    };
    blinkT = setTimeout(blink, 1800);

    // only animate while the hero is on screen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('avatar:back', back);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(blinkT); io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('avatar:back', back);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [awake, side]);

  return (
    <div ref={root} className={`avatar${side ? ' avatar--side' : ''}${awake === null ? '' : awake ? ' is-awake' : ' is-asleep'}`} aria-hidden="true">
      <div className="avatar__halo" />
      <div className="avatar__ripple" />
      <div className="avatar__ripple avatar__ripple--late" />
      <div className="avatar__orb">
        <div className="avatar__shine" />
        <div className="avatar__grain" />
        <div className="avatar__face">
          <i className="avatar__eye" /><i className="avatar__eye" />
        </div>
        <div className="avatar__zs"><b>z</b><b>z</b><b>Z</b></div>
      </div>
    </div>
  );
}
