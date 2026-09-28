'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';

export type Slide = { id: string; title: string; content: React.ReactNode };

/**
 * The insights as a deck: one section at a time, moved through with the
 * arrows, the tabs, ←/→ keys or a swipe. "Present" goes full screen.
 * The address remembers the section (#audience), and the numbers refresh
 * every minute while the tab is open.
 */
export default function Deck({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [presenting, setPresenting] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const atRef = useRef(0);
  const show = useCallback((i: number) => {
    const next = (i + slides.length) % slides.length;
    setDir(next >= atRef.current ? 1 : -1);
    atRef.current = next;
    setAt(next);
    history.replaceState(null, '', `${location.pathname}${location.search}#${slides[next].id}`);
  }, [slides]);

  // start on the section in the address, and follow links to #section
  useEffect(() => {
    const sync = () => {
      const i = slides.findIndex((s) => `#${s.id}` === location.hash);
      if (i >= 0 && i !== atRef.current) { setDir(i > atRef.current ? 1 : -1); atRef.current = i; setAt(i); }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [slides]);

  // ← / → between sections, Esc leaves presenting
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], [role="tablist"]')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(at + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(at - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at, show]);

  // full screen
  const present = async () => {
    const el = root.current!;
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    try { await el.requestFullscreen(); } catch { setPresenting((p) => !p); }
  };
  useEffect(() => {
    const onChange = () => setPresenting(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.fullscreenElement) setPresenting(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting]);

  // fresh numbers every minute while visible
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, 60_000);
    return () => clearInterval(id);
  }, [router]);

  // swipe between sections (not on the map, which drags)
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || (e.target as Element).closest('[data-noswipe]')) return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) show(at + (dx < 0 ? 1 : -1));
  };

  return (
    <div ref={root} className={`deck${presenting ? ' is-presenting' : ''}`}>
      <nav className="deck__nav" aria-label="Sections">
        <div className="deck__tabs" role="tablist">
          {slides.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === at} aria-controls={`slide-${s.id}`} onClick={() => show(i)}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>{s.title}
            </button>
          ))}
        </div>
        <div className="deck__step">
          <span className="deck__count mono" aria-live="polite">{String(at + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => show(at - 1)} aria-label="Previous section"><ArrowLeft size={16} /></button>
          <button type="button" onClick={() => show(at + 1)} aria-label="Next section"><ArrowRight size={16} /></button>
          <button type="button" className="deck__present" onClick={present} aria-pressed={presenting}>
            {presenting ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
            <span>{presenting ? 'Exit' : 'Present'}</span>
          </button>
        </div>
      </nav>

      <div className="deck__stage" onPointerDown={onDown} onPointerUp={onUp}>
        {slides.map((s, i) => (
          <section key={s.id} id={`slide-${s.id}`} role="tabpanel" aria-label={s.title}
            className={`deck__slide${i === at ? ` is-current from-${dir > 0 ? 'right' : 'left'}` : ''}`} hidden={i !== at}>
            {s.content}
          </section>
        ))}
      </div>

      <div className="deck__dots" aria-hidden="true">
        {slides.map((s, i) => <i key={s.id} className={i === at ? 'is-on' : ''} />)}
      </div>
    </div>
  );
}
