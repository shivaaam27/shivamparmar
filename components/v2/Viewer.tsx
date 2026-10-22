'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLenis } from 'lenis/react';
import { v2 } from '@/lib/v2';
import { srcSet, thumbOf } from '@/lib/thumb';
import V2Compare from './Compare';
import { ArrowUR } from './Art';

export type ViewShot = { src: string; alt: string; project: string; slug: string; video?: string; w?: number; h?: number; screen?: boolean; compare?: { video: string; poster: string; label: string; otherLabel: string } };
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * V2's full-screen viewer: deep green, the picture (or video) in the middle with a soft rounded frame,
 * round arrows either side, the count and the project in pills on top, and a strip of thumbnails below.
 * ← / → keys, swiping, or the thumbnails move through it; Esc or Close leaves.
 */
export default function Viewer({ shots, start, onClose }: { shots: ViewShot[]; start: number; onClose: () => void }) {
  const [at, setAt] = useState(start);
  const [dir, setDir] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const shot = shots[at];
  const [loaded, setLoaded] = useState<string | null>(null);
  const lenis = useLenis();
  const go = useCallback((n: number) => { setDir(Math.sign(n - at)); setAt(Math.max(0, Math.min(shots.length - 1, n))); }, [at, shots.length]);

  // the page behind stays still while the viewer is open
  useEffect(() => { lenis?.stop(); return () => { lenis?.start(); }; }, [lenis]);

  // the pictures either side are fetched ahead, so stepping through is instant
  useEffect(() => {
    [at - 1, at + 1, at + 2].forEach((i) => {
      const s = shots[i];
      if (s && !s.video) { const im = new Image(); im.decoding = 'async'; im.src = s.src; }
    });
  }, [at, shots]);

  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(at + 1);
      if (e.key === 'ArrowLeft') go(at - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => { html.style.overflow = before; window.removeEventListener('keydown', onKey); };
  }, [onClose, go, at]);

  useEffect(() => {
    const el = strip.current, t = el?.querySelectorAll('button')[at];
    if (el && t) el.scrollTo({ left: t.offsetLeft - el.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
  }, [at]);

  return (
    <div className="v2-viewer" role="dialog" aria-modal="true" aria-label="Photos" data-lenis-prevent
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const x0 = touch.current; touch.current = null; if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(at + (dx < 0 ? 1 : -1)); }}>
      <div className="v2-petals" aria-hidden="true" />
      <header className="v2-viewer__bar">
        <span className="v2-pill v2-pill--lime" aria-live="polite">{pad(at + 1)} / {pad(shots.length)}</span>
        <Link className="v2-pill v2-viewer__project" href={v2(`/work/${shot.slug}`)}>{shot.project}<ArrowUR size={13} /></Link>
        <button type="button" className="v2-viewer__close" onClick={onClose} autoFocus aria-label="Close"><i /><i /></button>
      </header>

      <div className="v2-viewer__stage">
        <button type="button" className="v2-viewer__arrow" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous">←</button>
        <figure key={at} className={`v2-viewer__frame${shot.screen ? ' is-screen' : ''}`} style={{ '--from': `${dir * 40}px` } as React.CSSProperties}>
          {shot.compare && shot.video
            ? <V2Compare a={shot.video} b={shot.compare.video} posterA={shot.src} posterB={shot.compare.poster} labelA={shot.compare.label} labelB={shot.compare.otherLabel} alt={shot.alt} active />
            : shot.video
            ? <video src={shot.video} poster={shot.src} controls controlsList="nodownload noremoteplayback" disablePictureInPicture playsInline loop autoPlay aria-label={shot.alt} />
            : (
              // the small copy shows at once (the grid already loaded it); the full picture fades in over it when ready
              <span className={`v2-viewer__pic${loaded === shot.src ? ' is-loaded' : ''}`}
                style={shot.w && shot.h ? { aspectRatio: `${shot.w} / ${shot.h}`, width: `min(100%, calc((100svh - 11.5rem) * ${(shot.w / shot.h).toFixed(4)}))` } : undefined}>
                <img className="v2-viewer__lo" src={thumbOf(shot.src, shot.w)} alt="" aria-hidden="true" draggable={false} />
                <img className="v2-viewer__hi" src={shot.src} srcSet={srcSet(shot.src, shot.w)} sizes="100vw" alt={shot.alt} draggable={false}
                  decoding="async" onLoad={() => setLoaded(shot.src)} ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(shot.src); }} />
              </span>
            )}
        </figure>
        <button type="button" className="v2-viewer__arrow" onClick={() => go(at + 1)} disabled={at === shots.length - 1} aria-label="Next">→</button>
      </div>

      <div className="v2-viewer__foot">
        <div className="v2-viewer__thumbs" ref={strip} role="tablist" aria-label="All photos">
          {shots.map((s, i) => (
            <button key={s.src + i} type="button" role="tab" aria-selected={i === at} className={i === at ? 'is-on' : undefined}
              aria-label={`${s.video ? 'Video' : 'Photo'} ${i + 1}: ${s.project}`} onClick={() => go(i)}>
              <img src={thumbOf(s.src, s.w)} alt="" loading="lazy" decoding="async" draggable={false} />
            </button>
          ))}
        </div>
        <p className="v2-viewer__rights">© {new Date().getFullYear()} All rights reserved · not for reuse</p>
      </div>
    </div>
  );
}
