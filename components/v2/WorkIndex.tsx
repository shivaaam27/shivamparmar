'use client';

import { ViewTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { tc, v2 } from '@/lib/v2';
import { ArrowUR } from './Art';
import { LOOP, THIN } from './Hero';
import { thumbOf } from '@/lib/thumb';

/** One project on the work page (made on the server from lib/work.ts). */
export type ReelEntry = {
  slug: string; title: string; category: string; categorySlug: string; collection: string;
  summary?: string; cover: string; coverW?: number; coverH?: number; screen?: boolean; video?: string; pictures: number; videos: number;
  /** a whole category shown as one tile: where it opens and how many projects it holds */
  href?: string; count?: number;
};

/** The project's picture, the same element on the work page, the project page and the "next" panel, so it morphs between them. */
export function ProjectMedia({ e, active = true, priority = false }: { e: Pick<ReelEntry, 'slug' | 'cover' | 'video' | 'title' | 'screen'>; active?: boolean; priority?: boolean }) {
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v || prefersReducedMotion()) return;
    if (active) v.play().catch(() => {}); else v.pause();
  }, [active]);
  return (
    <ViewTransition name={`work-${e.slug}`} share="v2-morph" default="none">
      <div className={`v2-pmedia${e.screen ? ' is-screen' : ''}`}>
        <img src={e.cover} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
        {e.video && active && <video ref={vid} src={e.video} poster={e.cover} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
      </div>
    </ViewTransition>
  );
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ROWS = 3;
/** A picture's own shape, as it was uploaded (landscape, 4:5, tall), kept within sensible limits. */
const ratio = (e: ReelEntry) => Math.min(2, Math.max(.5, e.coverW && e.coverH ? e.coverW / e.coverH : .8));
const mod = (a: number, m: number) => ((a % m) + m) % m;

/**
 * The top of the work page (docs/V2-PLAN.md, "Work pages"): on the deep green, the title and the loop line (it fades
 * where it meets the words, as on the home page) over a wall of the work, drifting slowly to the right under the
 * green. Scrolling, the title and the line leave, the green turns to the light paper and the wall comes forward.
 *
 * The wall is three rows of pictures at one height, each as wide as its own shape (nothing is cropped into another
 * shape). Every row holds all the work in its own order and runs on endlessly: a row is its set laid a few times over,
 * moved by a transform that wraps at the set's width. Drag, swipe, trackpad or the arrows move it, with a little glide.
 * On the main page a big category is one tile that opens its own page. Below (children): the filters, every picture.
 */
export default function V2WorkIndex({ entries, title, lead, children }: { entries: ReelEntry[]; title: [string, string]; lead: string; children?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const rowEls = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLElement>(null);
  const front = useRef(false);
  const pos = useRef({ x: 0, target: 0 });
  const [isFront, setFront] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const n = entries.length;
  const few = n <= 2; // one or two pictures: one row, at their own shapes, still
  const [copies, setCopies] = useState<number[]>(() => Array(ROWS).fill(3));
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);
  const projects = entries.reduce((sum, e) => sum + (e.count ?? 1), 0);

  // each row has every tile, in its own order (moved along, the middle row reversed), so no two rows line up
  const rows = few ? [entries] : Array.from({ length: ROWS }, (_, r) => {
    const off = Math.floor((n * r) / ROWS) + r;
    const seq = [...entries.slice(off % n), ...entries.slice(0, off % n)];
    return r === 1 ? seq.reverse() : seq;
  });

  // scrolling: the words go, the green lifts to the paper and the wall settles, then it holds
  useGSAP(() => {
    const el = root.current!;
    const show = (on: boolean) => { if (front.current !== on) { front.current = on; setFront(on); } };
    if (prefersReducedMotion()) { el.classList.add('is-still'); show(true); return; }
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => `+=${el.offsetHeight - window.innerHeight}`, scrub: .8, invalidateOnRefresh: true,
        onUpdate: (s) => show(s.progress > .5),
      },
    });
    tl.to(q('.v2-wo__head'), { autoAlpha: 0, y: -60, duration: 1, ease: 'power2.in' })
      .to(q('.v2-hloop'), { autoAlpha: 0, duration: 1 }, '<.1')
      .to(q('.v2-wo__veil'), { autoAlpha: 0, duration: 1.4, ease: 'power1.inOut' }, '<.4')
      .fromTo(q('.v2-wo__wall'), { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out' }, '<')
      .to(q('.v2-wo__stick'), { backgroundColor: '#F4F1E6', duration: 1.2, ease: 'power1.inOut' }, '<.5')
      .to({}, { duration: 1.2 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  // the rows: measure each set's width, lay enough copies to cover the screen, and move them every frame
  useEffect(() => {
    const w = wall.current;
    if (!w || few) return;
    const widths: number[] = [];
    const measure = () => {
      const need = rowEls.current.map((row, r) => {
        const t = row?.children as HTMLCollectionOf<HTMLElement> | undefined;
        const per = rows[r].length;
        widths[r] = t && t[per] ? t[per].offsetLeft - t[0].offsetLeft : 0;
        return widths[r] ? Math.ceil(w.clientWidth / widths[r]) + 2 : 3;
      });
      setCopies((c) => (c.join() === need.join() ? c : need));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);

    const still = prefersReducedMotion();
    let raf = 0, last = performance.now(), held = false, shown = -1;
    const tick = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      const p = pos.current;
      if (!held && !front.current && !still) p.target -= dt * .028;    // the drift, to the right
      const d = p.target - p.x;
      if (Math.abs(d) > .05) p.x += still ? d : d * Math.min(1, dt * .012);
      if (p.x !== shown) {
        shown = p.x;
        // each row starts a little further along than the one above, so even same-shaped pictures sit like bricks
        rowEls.current.forEach((row, r) => { if (row && widths[r]) row.style.transform = `translate3d(${-mod(p.x + r * w.clientHeight * .09, widths[r])}px,0,0)`; });
        if (bar.current && widths[0]) bar.current.style.transform = `scaleX(${Math.max(.06, mod(p.x, widths[0]) / widths[0])})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // drag and swipe (the page still scrolls up and down: the wall only takes sideways moves)
    let start: { x: number; at: number; t: number; id: number } | null = null, dragged = false, vx = 0;
    const down = (e: PointerEvent) => {
      held = true;
      if (!front.current || e.button > 0) return;
      start = { x: e.clientX, at: pos.current.target, t: e.timeStamp, id: e.pointerId }; dragged = false; vx = 0;
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      if (!dragged && Math.abs(dx) > 6) { dragged = true; w.setPointerCapture(e.pointerId); w.classList.add('is-dragging'); }
      if (!dragged) return;
      const prev = pos.current.target;
      pos.current.target = pos.current.x = start.at - dx;
      const dtm = Math.max(1, e.timeStamp - start.t);
      vx = (pos.current.target - prev) / dtm; start.t = e.timeStamp;
    };
    const up = () => {
      if (dragged) pos.current.target += vx * 260;                     // a little glide after letting go
      start = null;
      w.classList.remove('is-dragging');
      setTimeout(() => { dragged = false; }, 0);
    };
    // a drag is not a click on the tile under it
    const click = (e: MouseEvent) => { if (dragged) { e.preventDefault(); e.stopPropagation(); } };
    // a trackpad's sideways swipe moves the wall; up and down stay with the page
    const wheel = (e: WheelEvent) => {
      if (!front.current || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation();
      held = true;
      pos.current.target += e.deltaX;
    };
    w.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    w.addEventListener('click', click, true);
    w.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      w.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      w.removeEventListener('click', click, true);
      w.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [few]);
  useEffect(() => { ScrollTrigger.refresh(); }, []);

  const step = (d: number) => { pos.current.target += d * (wall.current?.clientWidth ?? 1000) * .6; };

  return (
    <>
      <section ref={root} className={`v2-wo${isFront ? ' is-front' : ''}${drawn ? ' is-drawn' : ''}${few ? ' is-few' : ''}`} aria-label="Work">
        <div className="v2-wo__stick">
          <div ref={wall} className="v2-wo__wall">
            {rows.map((seq, r) => (
              <div key={r} ref={(el) => { rowEls.current[r] = el; }} className="v2-wo__row">
                {Array.from({ length: few ? 1 : copies[r] }, (_, c) => seq.map((e, i) => {
                  // the first set of the first row holds the real tiles (they morph into the project page); every
                  // other tile is a repeat: seen, but skipped by keyboards and screen readers
                  const real = r === 0 && c === 0;
                  const href = v2(e.href ?? `/work/${e.slug}`);
                  const cover = thumbOf(e.cover, e.coverW);
                  const label = e.count ? `${e.count} projects` : tc(e.category);
                  const ar = ratio(e);
                  return (
                    <Link key={`${c}-${i}`} href={href} draggable={false} className={`v2-wo__tile${ar > 1.15 ? ' is-land' : ar < .7 ? ' is-tall' : ''}`}
                      style={{ '--ar': ar } as React.CSSProperties} tabIndex={isFront && real ? 0 : -1} aria-hidden={!real || undefined}
                      aria-label={real ? `${e.title}, ${label}. Open` : undefined} onClick={() => track(`Open ${e.count ? 'category' : 'project'} · ${e.title}`)}>
                      {real
                        ? <ProjectMedia e={{ ...e, cover }} active={false} priority />
                        : <span className={`v2-pmedia${e.screen ? ' is-screen' : ''}`}><img src={cover} alt="" loading="lazy" decoding="async" draggable={false} /></span>}
                      <span className="v2-wo__say"><span className="v2-wo__cat">{label}</span><span className="v2-wo__name">{tc(e.title)}</span></span>
                      <span className="v2-wo__go v2-wo__say" aria-hidden="true"><ArrowUR /></span>
                    </Link>
                  );
                }))}
              </div>
            ))}
          </div>
          <div className="v2-wo__veil" aria-hidden="true" />
          <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path className="v2-hloop__thin" d={THIN} pathLength={1} />
            <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          </svg>
          <div className="v2-wo__head">
            <h1 className="v2-wo__title">{title[0] && <>{tc(title[0])} </>}<em>{tc(title[1], { start: !title[0] })}</em></h1>
            <p className="v2-wo__lead">{tc(lead)}</p>
            <p className="v2-wo__hint">{projects} {projects === 1 ? 'project' : 'projects'} · scroll</p>
          </div>
          {/* under the wall, centred: back, how far along, forward */}
          <div className="v2-wo__bar">
            <button type="button" className="v2-wo__arrow" onClick={() => step(-1)} aria-label="Earlier work"><Arrow flip /></button>
            <span className="v2-wo__meter">
              <span className="v2-wo__count"><b>{projects}</b> {projects === 1 ? 'project' : 'projects'}</span>
              <span className="v2-wo__track" aria-hidden="true"><i ref={bar} /></span>
            </span>
            <button type="button" className="v2-wo__arrow" onClick={() => step(1)} aria-label="More work"><Arrow /></button>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
