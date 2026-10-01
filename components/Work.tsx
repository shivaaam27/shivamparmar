'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { work } from '@/lib/content';
import { visibleCategories, countCategory, hasPage } from '@/lib/work';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';
import Wheel, { type WheelItem } from './Wheel';
import { track } from '@/lib/track';

/** Only categories and sub-categories that have pictures. */
const categories = visibleCategories();

/** Every project with a page, in site order, with where it sits. */
const entries = categories.flatMap((cat, g) =>
  cat.subcategories.flatMap((sub) =>
    sub.projects.filter(hasPage).map((project) => ({ cat, g, sub, project }))));

/** How many pictures each project lends to the strip (one project on its own shows more). */
const PER_PROJECT = 3, ALONE = 24;
/** Drift speed of the strip, in px per second. */
const SPEED = 38;

type Filter = { c: number; s: number };   // category / sub-category index, -1 = all
function readFilter(): Filter {
  const q = new URLSearchParams(window.location.search);
  const c = categories.findIndex((cat) => cat.slug === q.get('c'));
  const s = c < 0 ? -1 : categories[c].subcategories.findIndex((sub) => sub.slug === q.get('s'));
  return { c, s };
}
function writeFilter({ c, s }: Filter) {
  const q = new URLSearchParams();
  if (c >= 0) q.set('c', categories[c].slug);
  if (c >= 0 && s >= 0) q.set('s', categories[c].subcategories[s].slug);
  const qs = q.toString();
  window.history.pushState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}#work`);
}
const ALL = '__all';

/**
 * Work: the title with the work page's scroll wheels right beside it (a category, then its
 * sub-categories), and under it a strip of 4:5 pictures from the chosen work, divided by a hairline,
 * drifting steadily from right to left. It pauses under the pointer; small arrows step through it.
 * Each picture opens its project.
 */
export default function Work() {
  const [filter, setFilterState] = useState<Filter>({ c: -1, s: -1 });

  useEffect(() => {
    const sync = () => setFilterState(readFilter());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const setFilter = useCallback((f: Filter) => {
    const cat = categories[f.c];
    track(cat ? `Filter · ${cat.name}${f.s >= 0 ? ` › ${cat.subcategories[f.s].name}` : ''}` : 'Filter · All work');
    setFilterState(f);
    writeFilter(f);
  }, []);

  const shown = useMemo(() => entries.filter((e) =>
    (filter.c < 0 || e.g === filter.c) && (filter.s < 0 || e.sub === categories[filter.c].subcategories[filter.s])), [filter]);

  // the strip's pictures: a few from each project, or many when one project is on its own
  const pics = useMemo(() => {
    const per = shown.length === 1 ? ALONE : PER_PROJECT;
    const one = shown.flatMap(({ project }) => (project.images ?? []).slice(0, per)
      .map((img) => ({ src: img.src, alt: img.alt, slug: project.slug, title: project.title })));
    // a project with only a picture or two is repeated so the strip always fills the screen
    let all = one;
    while (one.length && all.length < 8) all = all.concat(one);
    return all;
  }, [shown]);

  // the wheels, as on the work page: categories, then the chosen one's sub-categories
  const focused = filter.c >= 0 ? categories[filter.c] : null;
  const catItems: WheelItem[] = [
    { key: ALL, label: 'All', count: entries.length },
    ...categories.map((cat) => ({ key: cat.slug, label: cat.name, count: countCategory(cat) })),
  ];
  const subItems: WheelItem[] = focused ? [
    { key: ALL, label: 'All', count: countCategory(focused) },
    ...focused.subcategories.map((sub) => ({ key: sub.slug, label: sub.name, count: sub.projects.length })),
  ] : [];

  // ---- the strip: a steady drift to the left, looping seamlessly (the pictures are laid out twice)
  const strip = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const nudge = useRef(0);          // px still to travel from an arrow press
  const hovered = useRef(false);
  const drag = useRef<{ startX: number; lastX: number; moved: number; id: number } | null>(null);
  const dragDx = useRef(0);         // px dragged since the last frame
  const dragged = useRef(false);    // a drag just happened: the click that ends it opens nothing
  useEffect(() => {
    const el = strip.current; if (!el) return;
    const still = prefersReducedMotion();
    let x = 0, v = still ? 0 : SPEED, last = performance.now(), raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (reel.current) io.observe(reel.current);
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const half = el.scrollWidth / 2;
      // ease the drift down under the pointer (or off screen), back up when it leaves
      const target = still || hovered.current || drag.current || !visible ? 0 : SPEED;
      v += (target - v) * Math.min(1, dt * 4);
      // an arrow press glides the strip by one picture
      const step = nudge.current * Math.min(1, dt * 7);
      nudge.current -= step;
      x -= v * dt + step;
      x += dragDx.current; dragDx.current = 0;   // follow the hand while dragging
      if (half > 0) { while (x <= -half) x += half; while (x > 0) x -= half; }
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [pics]);
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { startX: e.clientX, lastX: e.clientX, moved: 0, id: e.pointerId };
    dragged.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.lastX; d.lastX = e.clientX; d.moved += Math.abs(dx);
    if (d.moved > 6 && !dragged.current) { dragged.current = true; (e.currentTarget as HTMLElement).setPointerCapture(d.id); }
    if (dragged.current) dragDx.current += dx;
  };
  const onUp = () => { drag.current = null; };
  const stepBy = (dir: 1 | -1) => {
    const card = strip.current?.firstElementChild as HTMLElement | null;
    nudge.current += dir * (card ? card.offsetWidth + 1 : 300);
    track('Work strip · arrow');
  };

  // ---- Blobby rises behind the header as you scroll into Work (and the small one by
  // "Read more about me" shrinks away, as if it's the same Blobby coming down the page)
  const head = useRef<HTMLDivElement>(null);
  const dome = useRef<HTMLDivElement>(null);
  const domeEyes = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = dome.current; if (!el || !head.current) return;
    if (prefersReducedMotion()) { el.style.setProperty('--g', '1'); return; }
    const st = ScrollTrigger.create({
      trigger: head.current, start: 'top 92%', end: 'top 30%', scrub: 0.8,
      onUpdate: (self) => {
        const g = gsap.parseEase('power2.out')(self.progress);
        el.style.setProperty('--g', g.toFixed(3));
        document.documentElement.style.setProperty('--blobby-away', Math.min(1, self.progress * 1.6).toFixed(3));
      },
    });
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      const eyes = domeEyes.current; if (!eyes) return;
      const r = eyes.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300); tx = (dx / d) * k * 9; ty = (dy / d) * k * 6;
    };
    const loop = () => {
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      domeEyes.current?.style.setProperty('--look', `${x.toFixed(2)}px ${y.toFixed(2)}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { st.kill(); cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); document.documentElement.style.removeProperty('--blobby-away'); };
  }, []);

  return (
    <section className="work section" id="work">
      <div className="work__head" ref={head}>
        {/* Blobby, grown into the top of a great moonstone circle rising behind the header: its upper
            edge dissolves into the page, its eyes off to the right, watching the pointer */}
        <div className="work__dome" ref={dome} aria-hidden="true">
          <span className="work__dome-cap" />
          <span className="work__dome-eyes" ref={domeEyes}><i /><i /></span>
        </div>
        <h2 className="display reveal">
          <Link className="work__title-link" href="/work" onClick={() => track('Open work page')}>{work.title}<span className="work__title-arrow" aria-hidden="true">↗</span></Link>
        </h2>
        {/* right beside the word: the category wheel, and the chosen category's sub-categories beside it.
            Pointing at an item, or choosing it, draws Blobby's thin highlighter */}
        <div className="work__wheels reveal" data-delay="1">
          <Wheel label="Category" items={catItems} value={focused?.slug ?? ALL}
            onChange={(k) => setFilter({ c: k === ALL ? -1 : categories.findIndex((cat) => cat.slug === k), s: -1 })} />
          {focused && (
            <Wheel key={focused.slug} label={focused.name} items={subItems} value={filter.s >= 0 ? focused.subcategories[filter.s].slug : ALL}
              onChange={(k) => setFilter({ c: filter.c, s: k === ALL ? -1 : focused.subcategories.findIndex((sub) => sub.slug === k) })} />
          )}
        </div>
      </div>

      <div className="work__reel reveal" data-delay="2" ref={reel}
        onPointerEnter={() => { hovered.current = true; }} onPointerLeave={() => { hovered.current = false; drag.current = null; }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
        onDragStart={(e) => e.preventDefault()}>
        <div className="work__track" ref={strip} key={`${filter.c}.${filter.s}`}>
          {[0, 1].map((copy) => pics.map((p, i) => (
            <Link key={`${copy}-${p.slug}-${i}`} className="work__card" href={`/work/${p.slug}`}
              aria-hidden={copy === 1 || undefined} tabIndex={copy === 1 ? -1 : undefined}
              onClick={() => track(`Open project · ${p.title}`)}>
              <img src={p.src} alt={copy === 0 ? p.alt : ''} loading={i < 8 ? 'eager' : 'lazy'} />
              <span className="work__card-name mono">{p.title}</span>
            </Link>
          )))}
        </div>
      </div>
      <div className="work__arrows reveal" data-delay="2">
        <button type="button" onClick={() => stepBy(-1)} aria-label="Previous pictures"><ArrowLeft size={16} strokeWidth={1.5} /></button>
        <button type="button" onClick={() => stepBy(1)} aria-label="Next pictures"><ArrowRight size={16} strokeWidth={1.5} /></button>
      </div>
    </section>
  );
}
