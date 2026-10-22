'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/**
 * Day and night side by side, with a slider to compare.
 * Two frame-matched recordings of the same walkthrough (day and night) playing in step, with a
 * divider between them: the left of the divider shows the first, the right the second. Drag
 * anywhere on the video (or use the arrow keys on the handle) to move it. The second video
 * follows the first's clock, so they never drift apart.
 */
export default function V2Compare({ a, b, posterA, posterB, labelA, labelB, alt, active, className }: {
  a: string; b: string; posterA: string; posterB: string; labelA: string; labelB: string; alt: string;
  /** in the carousel: play only while it's the slide in front (otherwise it plays while on screen) */
  active?: boolean; className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const va = useRef<HTMLVideoElement>(null);
  const vb = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState(50);
  const [playing, setPlaying] = useState(false);
  const dragging = useRef(false);

  // play while on screen; keep the second video on the first's time
  useEffect(() => {
    const A = va.current, B = vb.current, el = box.current;
    if (!A || !B || !el) return;
    let raf = 0;
    const follow = () => {
      raf = requestAnimationFrame(follow);
      if (Math.abs(B.currentTime - A.currentTime) > 0.06) B.currentTime = A.currentTime;
      if (A.paused !== B.paused) (A.paused ? B.pause() : B.play().catch(() => {}));
    };
    raf = requestAnimationFrame(follow);
    if (active !== undefined) return () => cancelAnimationFrame(raf);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) A.play().then(() => setPlaying(true)).catch(() => {});
      else { A.pause(); setPlaying(false); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [active]);

  // in the carousel: the slide in front plays, the others wait
  useEffect(() => {
    const A = va.current;
    if (!A || active === undefined) return;
    if (active) A.play().then(() => setPlaying(true)).catch(() => {});
    else { A.pause(); setPlaying(false); }
  }, [active]);

  const moveTo = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const toggle = () => {
    const A = va.current!;
    if (A.paused) A.play().then(() => setPlaying(true)).catch(() => {});
    else { A.pause(); setPlaying(false); }
  };

  return (
    <div
      ref={box}
      className={`v2-cv${className ? ` ${className}` : ''}`}
      style={{ '--pos': `${pos}%` } as React.CSSProperties}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest('.v2-cv__play')) return; dragging.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not a live pointer */ } moveTo(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) moveTo(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      {/* the second video fills the frame; the first sits on top, cut off at the divider */}
      <video ref={vb} className="v2-cv__video" src={b} poster={posterB} muted loop playsInline preload="metadata" aria-hidden="true" />
      <video ref={va} className="v2-cv__video v2-cv__video--top" src={a} poster={posterA} muted loop playsInline preload="metadata" aria-label={alt} />
      <span className="v2-cv__label v2-cv__label--a" aria-hidden="true">{labelA}</span>
      <span className="v2-cv__label v2-cv__label--b" aria-hidden="true">{labelB}</span>
      <div className="v2-cv__line" aria-hidden="true" />
      <button
        type="button" className="v2-cv__handle" role="slider" aria-label={`${labelA} or ${labelB}: drag to compare`}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)} aria-valuetext={`${Math.round(pos)}% ${labelA}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setPos((p) => Math.max(0, p - 5)); }
          if (e.key === 'ArrowRight') { e.preventDefault(); setPos((p) => Math.min(100, p + 5)); }
        }}
      >
        <ChevronLeft size={15} aria-hidden="true" /><ChevronRight size={15} aria-hidden="true" />
      </button>
      <button type="button" className="v2-cv__play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={14} fill="currentColor" strokeWidth={0} /> : <Play size={14} fill="currentColor" strokeWidth={0} />}
      </button>
    </div>
  );
}
