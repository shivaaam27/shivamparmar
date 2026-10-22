'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { tc } from '@/lib/v2';
import Tabs from './Tabs';
import { Kicker } from './Ui';

type Role = { years: string; role: string; place: string; text: string; group: string };
const ALL = '__all';

/**
 * The journey as a path: from the first diploma on the left to Shivo Labs on the right, every role is a card
 * hanging above or below one winding line. Drag it (or scroll sideways, or use the arrows) and a lime line draws
 * itself along the path as far as you have travelled. Work, Education or both.
 */
export default function V2Journey({ items, n }: { items: Role[]; n?: number }) {
  const [group, setGroup] = useState(ALL);
  const [narrow, setNarrow] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const lime = useRef<SVGPathElement>(null);
  const newest = items[0];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // oldest first, so the path reads like a story
  const shown = useMemo(() => [...items].reverse().filter((r) => group === ALL || r.group === group), [items, group]);
  const S = narrow ? 272 : 320, H = narrow ? 600 : 560, C = H / 2, PAD = narrow ? 20 : 40, A = 46;
  const width = PAD * 2 + S * shown.length;
  const xs = shown.map((_, i) => PAD + S * i + S / 2);
  const d = useMemo(() => {
    if (!xs.length) return '';
    let p = `M0 ${C} L${xs[0]} ${C}`;
    for (let i = 0; i < xs.length - 1; i++) {
      const s = i % 2 ? 1 : -1, x0 = xs[i], x1 = xs[i + 1];
      p += ` C${x0 + S / 3} ${C + A * s} ${x1 - S / 3} ${C + A * s} ${x1} ${C}`;
    }
    return `${p} L${width} ${C}`;
  }, [xs.join(), C, S, width]);

  // the lime line follows how far along the path you are
  useEffect(() => {
    const el = scroller.current, path = lime.current;
    if (!el || !path) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, (el.scrollLeft + el.clientWidth * 0.62) / el.scrollWidth);
      path.style.strokeDashoffset = String(1 - p);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [d]);

  // drag with the mouse (touch scrolls by itself)
  const drag = useRef<{ x: number; left: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag.current = { x: e.clientX, left: scroller.current!.scrollLeft }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (drag.current) scroller.current!.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current = null; };
  const step = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * S * 2, behavior: 'smooth' });

  const choose = (k: string) => { setGroup(k); scroller.current?.scrollTo({ left: 0 }); };
  const groups = [...new Set(items.map((r) => r.group))];

  return (
    <section className="v2-journey" id="experience" aria-label="Experience" data-reveal>
      <div className="v2-dark v2-journey__panel">
        <div className="v2-wrap">
          {n !== undefined && <Kicker n={n}>Experience</Kicker>}
          <div className="v2-journey__head">
            <h2 className="v2-h2 v2-rise">{tc('From the pharmacy')} <em>{tc('to Shivo Labs', { start: false })}</em></h2>
            <div className="v2-journey__tools v2-rise" style={{ '--d': 1 } as React.CSSProperties}>
              <Tabs label="Show" value={group} onChange={choose}
                items={[{ key: ALL, label: 'All', count: items.length }, ...groups.map((g) => ({ key: g, label: g, count: items.filter((r) => r.group === g).length }))]} />
              <div className="v2-journey__arrows">
                <button type="button" onClick={() => step(-1)} aria-label="Earlier"><ArrowLeft size={18} strokeWidth={1.6} /></button>
                <button type="button" onClick={() => step(1)} aria-label="Later"><ArrowRight size={18} strokeWidth={1.6} /></button>
              </div>
            </div>
          </div>
        </div>

        <div ref={scroller} className="v2-journey__scroll" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          tabIndex={0} aria-label="Roles, from the earliest to now">
          <div className="v2-journey__track" style={{ width, height: H, '--s': `${S}px`, '--c': `${C}px` } as React.CSSProperties}>
            <svg className="v2-journey__line" width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
              <path d={d} stroke="var(--pine)" strokeWidth={22} fill="none" strokeLinecap="round" />
              <path ref={lime} d={d} pathLength={1} stroke="var(--lime)" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
              {xs.map((x, i) => <circle key={i} cx={x} cy={C} r={shown[i] === newest ? 10 : 7} className={shown[i] === newest ? 'is-now' : undefined} />)}
            </svg>
            <ol className="v2-journey__list">
              {shown.map((r, i) => (
                <li key={`${r.years}-${r.role}`} className={`v2-jcard${i % 2 ? ' is-down' : ' is-up'}${r === newest ? ' is-now' : ''}`} style={{ left: xs[i] }}>
                  <span className="v2-jcard__top">
                    <span className="v2-jcard__years">{r.years}</span>
                    <span className="v2-jcard__group">{r === newest ? 'Now' : r.group}</span>
                  </span>
                  <b className="v2-jcard__role">{tc(r.role)}</b>
                  <span className="v2-jcard__place">{r.place}</span>
                  <p className="v2-jcard__text">{r.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="v2-wrap v2-journey__hint">Drag or scroll sideways</p>
      </div>
    </section>
  );
}
