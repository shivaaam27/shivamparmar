'use client';

import { ViewTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { tc } from '@/lib/title-case';
import { ArrowUR } from './Art';
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
 * The top of the work page (docs/SITE.md, "Work pages"): the title, centred at the top when the page opens, and under it
 * a wall of the work, drifting slowly to the right. There is no scroll-driven opening: the wall is there from the start.
 * The wall is up to three rows of pictures at one height, each as wide as its own shape (nothing is cropped into another
 * shape). Each piece of work is in one row only. Every row runs on endlessly (its set laid enough times over to fill the
 * screen, moved by a transform that wraps at the set's width; a short row repeats its pictures), and drifts on its own until
 * touched. Drag, swipe, trackpad or the arrows move it, with a little glide.
 * On the main page a big category is one tile that opens its own page. Below (children): the filters, every picture.
 */
export default function V2WorkIndex({ entries, title, children }: { entries: ReelEntry[]; title: string; children?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const rowEls = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLElement>(null);
  const pos = useRef({ x: 0, target: 0 });
  const n = entries.length;
  const few = n <= 2; // one or two pictures: one row, at their own shapes, still
  const [copies, setCopies] = useState<number[]>(() => Array(ROWS).fill(1));
  const [loops, setLoops] = useState<boolean[]>(() => Array(ROWS).fill(false));
  const projects = entries.reduce((sum, e) => sum + (e.count ?? 1), 0);

  // each piece of work is in one row only; every row runs on endlessly (a short row repeats its set to fill the screen)
  const count = few ? 1 : n < 7 ? 2 : ROWS;
  // dealt to the shortest row each time, so the rows come out about as long as each other (dealt in turn, one row was
  // often much longer than the rest)
  const rows = (() => {
    const out: ReelEntry[][] = Array.from({ length: count }, () => []);
    const len = new Array(count).fill(0);
    entries.forEach((e) => { const r = len.indexOf(Math.min(...len)); out[r].push(e); len[r] += ratio(e); });
    return out;
  })();
  const still = loops.slice(0, count).every((l) => !l);

  // the rows: measure each set's width, lay enough copies to cover the screen, and move them every frame
  useEffect(() => {
    const w = wall.current;
    if (!w || few) return;
    const widths: number[] = [];
    const runs: boolean[] = [];
    const measure = () => {
      const need = rows.map((seq, r) => {
        const row = rowEls.current[r];
        const t = row?.children as HTMLCollectionOf<HTMLElement> | undefined;
        const per = seq.length;
        if (!row || !t || !t[per - 1]) { widths[r] = 0; runs[r] = false; return 1; }
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        widths[r] = t[per - 1].offsetLeft + t[per - 1].offsetWidth + gap - t[0].offsetLeft;
        // every row runs on, however short: before, only a row wider than the screen moved, so one row drifted and
        // took the finger while the one above it stood still (and on a wide screen none moved at all)
        runs[r] = widths[r] > 0;
        return runs[r] ? Math.ceil(w.clientWidth / widths[r]) + 2 : 1;
      });
      setCopies((c) => (c.join() === need.join() ? c : need));
      setLoops((l) => (l.join() === runs.join() ? l : [...runs]));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);

    const still = prefersReducedMotion();
    let raf = 0, last = performance.now(), held = false, shown = -1;
    const tick = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      const p = pos.current;
      if (!held && !still) p.target -= dt * .028;                      // the drift, to the right (on a computer it waits while the pointer is on the wall)
      const d = p.target - p.x;
      if (Math.abs(d) > .05) p.x += still ? d : d * Math.min(1, dt * .012);
      if (p.x !== shown) {
        shown = p.x;
        // each row starts a little further along than the one above, so even same-shaped pictures sit like bricks
        rowEls.current.forEach((row, r) => { if (row) row.style.transform = runs[r] && widths[r] ? `translate3d(${-mod(p.x + r * w.clientHeight * .09, widths[r])}px,0,0)` : ''; });
        const lead = runs.findIndex(Boolean);
        if (bar.current && lead >= 0) bar.current.style.transform = `scaleX(${Math.max(.06, mod(p.x, widths[lead]) / widths[lead])})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // drag and swipe (the page still scrolls up and down: the wall only takes sideways moves)
    let start: { x: number; at: number; t: number; id: number } | null = null, dragged = false, vx = 0;
    const down = (e: PointerEvent) => {
      held = true;
      if (e.button > 0) return;
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
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation();
      held = true;
      pos.current.target += e.deltaX;
    };
    const rest = () => { held = true; };
    const resume = () => { if (!start) held = false; };
    w.addEventListener('pointerdown', down);
    w.addEventListener('mouseenter', rest);
    w.addEventListener('mouseleave', resume);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    w.addEventListener('click', click, true);
    w.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      w.removeEventListener('pointerdown', down);
      w.removeEventListener('mouseenter', rest);
      w.removeEventListener('mouseleave', resume);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      w.removeEventListener('click', click, true);
      w.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [few, count]);

  const step = (d: number) => { pos.current.target += d * (wall.current?.clientWidth ?? 1000) * .6; };

  return (
    <>
      <section ref={root} className={`v2-wo is-front${few ? ' is-few' : ''}${still ? ' is-held' : ''}`}
        style={{ '--rows': count } as React.CSSProperties} aria-label="Work">
        {/* the title, centred at the top: it is the first thing on the page when it opens */}
        {/* --chars: the longest word, so a long one (Photography) still fits a phone's width */}
        <h1 className="v2-wo__heading" style={{ '--chars': Math.max(...title.split(/\s+/).map((w) => w.length)) } as React.CSSProperties}>{tc(title)}</h1>
        <div className="v2-wo__stick">
          <div ref={wall} className="v2-wo__wall">
            {rows.map((seq, r) => (
              <div key={r} ref={(el) => { rowEls.current[r] = el; }} className={`v2-wo__row${loops[r] ? '' : ' is-held'}`}>
                {Array.from({ length: few ? 1 : copies[r] ?? 1 }, (_, c) => seq.map((e, i) => {
                  // the first set of each row holds the real tiles (they morph into the project page); every other
                  // tile is a repeat further along the same row, never on screen at once with it: skipped by keyboards
                  const real = c === 0;
                  const href = (e.href ?? `/work/${e.slug}`);
                  const cover = thumbOf(e.cover, e.coverW);
                  const label = e.count ? `${e.count} projects` : tc(e.category);
                  const ar = ratio(e);
                  return (
                    <Link key={`${c}-${i}`} href={href} draggable={false} className={`v2-wo__tile${ar > 1.15 ? ' is-land' : ar < .7 ? ' is-tall' : ''}`}
                      style={{ '--ar': ar } as React.CSSProperties} tabIndex={real ? 0 : -1} aria-hidden={!real || undefined}
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
      </section>
      {children}
    </>
  );
}
