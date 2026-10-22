'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { work } from '@/lib/content';
import { visibleCategories, countCategory, hasPage } from '@/lib/work';
import { prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { tc, v2 } from '@/lib/v2';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ArrowUR } from './Art';
import V2Wheel from './Wheel';
import { Kicker } from './Ui';

const ALL = '__all';

const categories = visibleCategories();
const entries = categories.flatMap((cat) => cat.subcategories.flatMap((sub) => sub.projects.filter(hasPage).map((project) => ({ cat, sub, project }))));
const PER_PROJECT = 3, ALONE = 24;
const SPEED = 36;

/**
 * Work on the home page: the big title, category pills, and a strip of rounded picture cards that drifts
 * slowly to the left. It slows under the pointer, can be dragged, and the arrows step through it.
 * Each card opens its project.
 */
export default function V2WorkRail() {
  const [cat, setCat] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const shown = useMemo(() => entries.filter((e) => (!cat || e.cat.slug === cat) && (!sub || e.sub.slug === sub)), [cat, sub]);
  const focused = categories.find((c) => c.slug === cat) ?? null;
  const pics = useMemo(() => {
    const per = shown.length === 1 ? ALONE : PER_PROJECT;
    const one = shown.flatMap(({ project, cat: c }) => (project.images ?? []).slice(0, per)
      .map((img) => ({ src: img.src, alt: img.alt, slug: project.slug, title: project.title, cat: c.name })));
    let all = one;
    while (one.length && all.length < 8) all = all.concat(one);
    return all;
  }, [shown]);

  const strip = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const nudge = useRef(0);
  const hovered = useRef(false);
  const drag = useRef<{ lastX: number; moved: number; id: number } | null>(null);
  const dragDx = useRef(0);
  const dragged = useRef(false);

  useEffect(() => {
    const el = strip.current; if (!el) return;
    const still = prefersReducedMotion();
    let x = 0, v = still ? 0 : SPEED, last = performance.now(), raf = 0, visible = true;
    let half = el.scrollWidth / 2;
    const ro = new ResizeObserver(() => { half = el.scrollWidth / 2; });
    ro.observe(el);
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    if (reel.current) io.observe(reel.current);
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const target = still || hovered.current || drag.current || !visible ? 0 : SPEED;
      v += (target - v) * Math.min(1, dt * 4);
      const step = nudge.current * Math.min(1, dt * 7);
      nudge.current -= step;
      x -= v * dt + step;
      x += dragDx.current; dragDx.current = 0;
      if (half > 0) { while (x <= -half) x += half; while (x > 0) x -= half; }
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      const resting = !visible && v < 0.5 && Math.abs(nudge.current) < 0.5 && !drag.current;
      raf = resting ? 0 : requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [pics]);

  const onDown = (e: React.PointerEvent) => { if (e.button !== 0) return; drag.current = { lastX: e.clientX, moved: 0, id: e.pointerId }; dragged.current = false; };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.lastX; d.lastX = e.clientX; d.moved += Math.abs(dx);
    if (d.moved > 6 && !dragged.current) { dragged.current = true; (e.currentTarget as HTMLElement).setPointerCapture(d.id); }
    if (dragged.current) dragDx.current += dx;
  };
  const onUp = () => { drag.current = null; };
  const stepBy = (dir: 1 | -1) => {
    const card = strip.current?.firstElementChild as HTMLElement | null;
    nudge.current += dir * (card ? card.offsetWidth + 16 : 300);
    track('Work strip · arrow');
  };

  return (
    <section className="v2-sec v2-sec--tight v2-work" id="work" aria-label={work.title} data-reveal>
      <div className="v2-wrap">
        <Kicker n={2}>{work.title}</Kicker>
        <div className="v2-work__head">
          <h2 className="v2-h2 v2-rise">
            <Link href={v2('/work')} className="v2-work__title" onClick={() => track('Open work page')}>{tc(work.tag)} <em>{tc(work.title, { start: false })}</em></Link>
          </h2>
          {/* V1's picker wheels: a category, then the chosen category's collections beside it */}
          <div className="v2-wheels v2-rise" style={{ '--d': 1 } as React.CSSProperties}>
            <V2Wheel label="Category" value={cat ?? ALL} onChange={(k) => { setCat(k === ALL ? null : k); setSub(null); track(`Filter · ${k}`); }}
              items={[{ key: ALL, label: 'All', count: entries.length }, ...categories.map((c) => ({ key: c.slug, label: tc(c.name), count: countCategory(c) }))]} />
            {focused && (
              <V2Wheel key={focused.slug} label={tc(focused.name)} value={sub ?? ALL} onChange={(k) => { setSub(k === ALL ? null : k); track(`Filter · ${focused.name} › ${k}`); }}
                items={[{ key: ALL, label: 'All', count: countCategory(focused) }, ...focused.subcategories.map((s) => ({ key: s.slug, label: tc(s.name), count: s.projects.length }))]} />
            )}
          </div>
        </div>
      </div>

      <div className="v2-work__reel" ref={reel}
        onPointerEnter={() => { hovered.current = true; }} onPointerLeave={() => { hovered.current = false; drag.current = null; }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
        onDragStart={(e) => e.preventDefault()}>
        <div className="v2-work__track" ref={strip} key={`${cat}.${sub}`}>
          {[0, 1].map((copy) => pics.map((p, i) => (
            <Link key={`${copy}-${p.slug}-${i}`} className="v2-work__card" href={v2(`/work/${p.slug}`)}
              aria-hidden={copy === 1 || undefined} tabIndex={copy === 1 ? -1 : undefined}
              onClick={() => track(`Open project · ${p.title}`)}>
              <img src={p.src} alt={copy === 0 ? p.alt : ''} loading={i < 6 ? 'eager' : 'lazy'} />
              <span className="v2-work__card-info">
                <span className="v2-work__card-cat">{p.cat}</span>
                <span className="v2-work__card-name">{tc(p.title)}</span>
              </span>
            </Link>
          )))}
        </div>
      </div>

      <div className="v2-wrap v2-work__foot">
        <div className="v2-work__arrows">
          <button type="button" onClick={() => stepBy(-1)} aria-label="Previous pictures"><ArrowLeft size={18} strokeWidth={1.6} /></button>
          <button type="button" onClick={() => stepBy(1)} aria-label="Next pictures"><ArrowRight size={18} strokeWidth={1.6} /></button>
        </div>
        <Link className="v2-more" href={v2('/work')}>See all work <ArrowUR /></Link>
      </div>
    </section>
  );
}
