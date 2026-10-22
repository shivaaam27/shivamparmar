'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { thumbOf } from '@/lib/thumb';
import V2Compare from './Compare';
import Viewer from './Viewer';
import type { GalleryShot } from './ProjectGallery';

const mod = (a: number, m: number) => ((a % m) + m) % m;
const ratio = (s: GalleryShot) => Math.min(2.2, Math.max(.45, s.w && s.h ? s.w / s.h : .8));

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * A project's pictures (after its opening one), the same idea as the work page's wall: small pictures in rows, each at
 * its own shape, running on sideways without end when there are more than fit; drag, swipe, trackpad or the arrows
 * move it, and any picture opens the full-screen viewer. A few pictures sit in one row, still and centred. A day / night
 * recording leads above, as its slider.
 */
export default function ProjectWall({ shots }: { shots: GalleryShot[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const close = useCallback(() => setViewing(null), []);
  const feature = shots.find((s) => s.compare && s.video);
  const pics = shots.filter((s) => s !== feature);
  const n = pics.length;
  const rowCount = n <= 4 ? 1 : n <= 12 ? 2 : 3;

  // share the pictures out so the rows are about as long as each other (each picture once)
  const rows: GalleryShot[][] = Array.from({ length: rowCount }, () => []);
  const len = new Array(rowCount).fill(0);
  pics.forEach((p) => { const r = len.indexOf(Math.min(...len)); rows[r].push(p); len[r] += ratio(p); });

  const wall = useRef<HTMLDivElement>(null);
  const rowEls = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ x: 0, target: 0 });
  const [copies, setCopies] = useState<number[]>(() => rows.map(() => 1));
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const w = wall.current;
    if (!w || !n) return;
    const widths: number[] = [];
    const measure = () => {
      // the width of one set of each row; a row longer than the screen repeats, so it runs on endlessly
      const one = rowEls.current.map((row, r) => {
        // (summed from the pictures' own widths: a short wall wraps its rows, so their positions say nothing)
        const t = row?.children as HTMLCollectionOf<HTMLElement> | undefined;
        const k = rows[r].length;
        if (!t || !t[k - 1]) return 0;
        const gap = parseFloat(getComputedStyle(row!).columnGap || '0');
        let sum = 0;
        for (let i = 0; i < k; i++) sum += t[i].offsetWidth + gap;
        return sum;
      });
      const runs = one.some((x) => x > w.clientWidth);
      one.forEach((x, r) => { widths[r] = runs ? x : 0; });
      const need = one.map((x) => (runs && x ? Math.ceil(w.clientWidth / x) + 2 : 1));
      setCopies((c) => (c.join() === need.join() ? c : need));
      setMoving(runs);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);

    const still = prefersReducedMotion();
    let raf = 0, last = performance.now(), held = false, shown = NaN;
    const tick = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      const p = pos.current;
      if (!held && !still && widths[0]) p.target += dt * .02;           // a slow drift until it is touched
      const d = p.target - p.x;
      if (Math.abs(d) > .05) p.x += still ? d : d * Math.min(1, dt * .012);
      if (p.x !== shown) {
        shown = p.x;
        rowEls.current.forEach((row, r) => { if (row && widths[r]) row.style.transform = `translate3d(${-mod(p.x + r * 140, widths[r])}px,0,0)`; });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let start: { x: number; at: number; t: number; id: number } | null = null, dragged = false, vx = 0;
    const down = (e: PointerEvent) => {
      held = true;
      if (!widths[0] || e.button > 0) return;
      start = { x: e.clientX, at: pos.current.target, t: e.timeStamp, id: e.pointerId }; dragged = false; vx = 0;
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      if (!dragged && Math.abs(dx) > 6) { dragged = true; w.setPointerCapture(e.pointerId); w.classList.add('is-dragging'); }
      if (!dragged) return;
      const prev = pos.current.target;
      pos.current.target = pos.current.x = start.at - dx;
      vx = (pos.current.target - prev) / Math.max(1, e.timeStamp - start.t); start.t = e.timeStamp;
    };
    const up = () => {
      if (dragged) pos.current.target += vx * 260;
      start = null;
      w.classList.remove('is-dragging');
      setTimeout(() => { dragged = false; }, 0);
    };
    const click = (e: MouseEvent) => { if (dragged) { e.preventDefault(); e.stopPropagation(); } };
    const wheel = (e: WheelEvent) => {
      if (!widths[0] || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation();
      held = true;
      pos.current.target += e.deltaX;
    };
    const hold = () => { held = true; };
    w.addEventListener('pointerdown', down);
    w.addEventListener('mouseenter', hold);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    w.addEventListener('click', click, true);
    w.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      w.removeEventListener('pointerdown', down);
      w.removeEventListener('mouseenter', hold);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      w.removeEventListener('click', click, true);
      w.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const step = (d: number) => { pos.current.target += d * (wall.current?.clientWidth ?? 1000) * .6; };

  return (
    <>
      {feature && (
        <div className="v2-gallery__feature">
          <V2Compare a={feature.video!} b={feature.compare!.video} posterA={feature.src} posterB={feature.compare!.poster}
            labelA={feature.compare!.label} labelB={feature.compare!.otherLabel} alt={feature.alt} />
        </div>
      )}
      {n > 0 && (
        <div className={`v2-pw${moving ? ' is-moving' : ''}${rowCount === 1 ? ' is-one' : ''}`}>
          <div ref={wall} className="v2-pw__wall">
            {rows.map((row, r) => (
              <div key={r} ref={(el) => { rowEls.current[r] = el; }} className="v2-pw__row">
                {Array.from({ length: copies[r] ?? 1 }, (_, c) => row.map((s, i) => {
                  const real = c === 0;
                  return (
                    <button key={`${c}-${i}`} type="button" className="v2-pw__pic" style={{ '--ar': ratio(s) } as React.CSSProperties}
                      tabIndex={real ? 0 : -1} aria-hidden={!real || undefined} aria-label={real ? `View ${s.video ? 'video' : 'picture'}: ${s.alt}` : undefined}
                      onClick={() => { setViewing(shots.indexOf(s)); track(`View ${s.video ? 'video' : 'photo'} · ${s.project}`); }}>
                      <img src={thumbOf(s.src, s.w)} alt="" loading="lazy" decoding="async" draggable={false} />
                      {s.video && <span className="v2-shot__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>}
                    </button>
                  );
                }))}
              </div>
            ))}
          </div>
          {moving && (
            <div className="v2-pw__bar">
              <button type="button" className="v2-pnav__icon" onClick={() => step(-1)} aria-label="Earlier pictures"><Arrow flip /></button>
              <span className="v2-pw__count">{n} {n === 1 ? 'picture' : 'pictures'}{shots.some((s) => s.video) ? ' and videos' : ''}</span>
              <button type="button" className="v2-pnav__icon" onClick={() => step(1)} aria-label="More pictures"><Arrow /></button>
            </div>
          )}
        </div>
      )}
      {viewing !== null && createPortal(<Viewer shots={shots} start={viewing} onClose={close} />, document.querySelector('.v2') ?? document.body)}
    </>
  );
}
