'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { work } from '@/lib/content';
import { visibleCategories, countCategory, hasPage, coverOf } from '@/lib/work';
import { prefersReducedMotion } from '@/lib/motion';
import Tag from './Tag';
import Wheel, { type WheelItem } from './Wheel';
import { track } from '@/lib/track';

/** Only categories and sub-categories that have pictures. */
const categories = visibleCategories();
const pad = (n: number) => String(n).padStart(2, '0');

/** Every project with a page, numbered in site order, with where it sits. */
const entries = categories.flatMap((cat, g) =>
  cat.subcategories.flatMap((sub) =>
    sub.projects.filter(hasPage).map((project) => ({ cat, g, sub, project }))))
  .map((e, i) => ({ ...e, n: i + 1 }));

/** How long each picture holds in the preview before the next one. */
const HOLD = 1700;

/** ?c=photography  <->  category index (-1 = all) */
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

/** A small spring: `x` chases `t`, overshooting a little and settling (the site's "springs, not easings"). */
const spring = (k = 0.15, damp = 0.7) => ({
  x: 0, v: 0, t: 0,
  step() { this.v = (this.v + (this.t - this.x) * k) * damp; this.x += this.v; return this.x; },
  jump(to: number) { this.x = this.t = to; this.v = 0; },
});

/**
 * Work, in the moonstone language. The categories are a capsule track whose stone marker springs to
 * the choice. Below, a compact numbered list sized to sit beside the 4:5 frame; a stone lens glides
 * behind the project you point at. The frame has a stone rim that catches the pointer's light, tilts
 * slightly toward it, and opens each picture as an iris from where the pointer is.
 */
export default function Work() {
  const [filter, setFilterState] = useState<Filter>({ c: -1, s: -1 });
  const [active, setActive] = useState(0);        // index into `shown`
  const [frame, setFrame] = useState(0);          // which picture of the active project
  const section = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const sync = () => { setFilterState(readFilter()); setActive(0); setFrame(0); };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const setFilter = useCallback((f: Filter) => {
    const cat = categories[f.c];
    track(cat ? `Filter · ${cat.name}${f.s >= 0 ? ` › ${cat.subcategories[f.s].name}` : ''}` : 'Filter · All work');
    setFilterState(f); setActive(0); setFrame(0);
    writeFilter(f);
  }, []);

  const shown = useMemo(() => entries.filter((e) =>
    (filter.c < 0 || e.g === filter.c) && (filter.s < 0 || e.sub === categories[filter.c].subcategories[filter.s])), [filter]);
  // the two scroll wheels, as on the work page: categories, then the chosen one's sub-categories
  const focused = filter.c >= 0 ? categories[filter.c] : null;
  const catItems: WheelItem[] = [
    { key: ALL, label: 'All', count: entries.length },
    ...categories.map((cat) => ({ key: cat.slug, label: cat.name, count: countCategory(cat) })),
  ];
  const subItems: WheelItem[] = focused ? [
    { key: ALL, label: 'All', count: countCategory(focused) },
    ...focused.subcategories.map((sub) => ({ key: sub.slug, label: sub.name, count: sub.projects.length })),
  ] : [];
  const current = shown[Math.min(active, shown.length - 1)];
  const pics = current?.project.images ?? [];

  // the preview flicks through the active project while the section is on screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!onScreen || pics.length < 2 || prefersReducedMotion()) return;
    const id = setInterval(() => { origin.current = null; setFrame((f) => (f + 1) % pics.length); }, HOLD);
    return () => clearInterval(id);
  }, [onScreen, pics.length, current?.project.slug]);

  // whatever was on show stays underneath while the next picture opens over it
  const [under, setUnder] = useState<string | null>(null);
  const shownSrc = pics[frame]?.src;
  const lastSrc = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastSrc.current && lastSrc.current !== shownSrc) setUnder(lastSrc.current);
    lastSrc.current = shownSrc;
  }, [shownSrc]);
  useEffect(() => {
    if (!under) return;
    const id = setTimeout(() => setUnder(null), 950);
    return () => clearTimeout(id);
  }, [under]);

  const choose = (i: number) => { if (i !== active) { setActive(i); setFrame(0); } };

  // once the section is near, fetch every project's first two pictures so a hover never waits
  const preloaded = useRef(false);
  useEffect(() => {
    if (!onScreen || preloaded.current) return;
    preloaded.current = true;
    entries.forEach(({ project }) => project.images?.slice(0, 2).forEach(({ src }) => { const im = new Image(); im.src = src; }));
  }, [onScreen]);

  // ---- Blobby rises under the row you're on: a thin outlined curve from 15% to 85% of the row's
  // bottom line, its eyes peeking out from beneath and watching the pointer; it sinks when you leave
  const list = useRef<HTMLOListElement>(null);
  const peek = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const ol = list.current, el = peek.current; if (!ol || !el) return;
    const eyes = el.querySelector<HTMLElement>('.work__peek-eyes');
    const py = spring(0.17, 0.68), up = spring(0.13, 0.66), ex = spring(0.1, 0.75);
    const still = prefersReducedMotion();
    let pointer: { x: number; y: number } | null = null, inside = false, raf = 0, first = true;
    const move = (e: PointerEvent) => { pointer = { x: e.clientX, y: e.clientY }; inside = true; };
    const leave = () => { inside = false; };
    ol.addEventListener('pointermove', move);
    ol.addEventListener('pointerleave', leave);
    const loop = () => {
      const row = ol.querySelector<HTMLElement>('.work__row.is-active');
      if (row) py.t = row.offsetTop + row.offsetHeight;                       // sits on the row's bottom line
      up.t = inside ? 1 : 0;
      const box = el.getBoundingClientRect();
      // the eyes drift a little toward the pointer along the curve
      if (pointer && box.width) ex.t = Math.max(-0.22, Math.min(0.22, (pointer.x - (box.left + box.width / 2)) / box.width));
      if (first || still) { py.jump(py.t); first = false; }
      const y = py.step(), u = up.step(), e = ex.step();
      el.style.transform = `translateY(${y}px)`;
      el.style.setProperty('--up', String(Math.max(0, Math.min(1.15, u))));
      if (eyes) {
        el.style.setProperty('--ex', `${e * 100}%`);
        if (pointer) {
          const r = eyes.getBoundingClientRect();
          const dx = pointer.x - (r.left + r.width / 2), dy = pointer.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 160);
          eyes.style.setProperty('--look', `${(dx / d) * k * 3}px ${(dy / d) * k * 2}px`);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ol.removeEventListener('pointermove', move); ol.removeEventListener('pointerleave', leave); };
  }, []);

  // ---- where the next picture's iris opens from
  const frameEl = useRef<HTMLAnchorElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const aimFrom = (clientX: number, clientY: number) => {
    const f = frameEl.current; if (!f) return;
    const r = f.getBoundingClientRect();
    origin.current = { x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * 100, y: Math.max(0, Math.min(1, (clientY - r.top) / r.height)) * 100 };
  };
  const iris = origin.current ?? { x: 50, y: 50 };

  return (
    <section ref={section} className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal">
          <Tag>{work.tag}</Tag>
          <Link className="work__title-link" href="/work" onClick={() => track('Open work page')}>{work.title}<span className="work__title-arrow" aria-hidden="true">↗</span></Link>
        </h2>
        {/* the work page's scroll wheels: pick a category, and its sub-categories open beside it.
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

      <div className="work__body reveal" data-delay="2">
        <ol className="work__list" ref={list} style={{ '--rows': Math.max(shown.length, 6) } as React.CSSProperties}>
          <li className="work__peek" ref={peek} aria-hidden="true">
            <svg className="work__peek-arc" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 30 C 22 -2, 78 -2, 100 30" /></svg>
            <span className="work__peek-eyes"><i /><i /></span>
          </li>
          {shown.map((e, i) => {
            const on = e === current;
            const where = e.sub.name === e.project.title ? e.cat.name : `${e.cat.name} · ${e.sub.name}`;
            return (
              <li key={e.project.slug} className={`work__row${on ? ' is-active' : ''}`}>
                <Link
                  href={`/work/${e.project.slug}`}
                  onPointerEnter={(ev) => { aimFrom(ev.clientX, ev.clientY); choose(i); }}
                  onFocus={() => { origin.current = null; choose(i); }}
                  onClick={() => track(`Open project · ${e.project.title}`)}
                >
                  <span className="work__num mono">{pad(e.n)}</span>
                  <span className="work__name">{e.project.title}</span>
                  <span className="work__where mono">{where}</span>
                  <span className="work__count mono">{pad(e.project.images?.length ?? 0)}</span>
                  {/* phones: a small picture on each row instead of the frame */}
                  <span className="work__thumb" aria-hidden="true"><img src={coverOf(e.project)} alt="" loading="lazy" /></span>
                </Link>
              </li>
            );
          })}
        </ol>

        {current && (
          <Link className="work__frame" ref={frameEl} href={`/work/${current.project.slug}`} aria-label={`Open ${current.project.title}`}
            onClick={() => track(`Open project · ${current.project.title}`)} onPointerMove={(ev) => aimFrom(ev.clientX, ev.clientY)}>
            <span className="work__pics" style={{ '--ix': `${iris.x}%`, '--iy': `${iris.y}%` } as React.CSSProperties}>
              {under && <img className="work__under" src={under} alt="" aria-hidden="true" />}
              {pics.map((pic, k) => (
                <img key={`${current.project.slug}-${pic.src}-${k === frame ? 'on' : 'off'}`} src={pic.src} alt={k === frame ? pic.alt : ''}
                  className={k === frame ? 'is-on' : undefined} loading="eager" />
              ))}
              <span className="work__caption mono">
                <span>{current.project.title}</span>
                <span>{pad(frame + 1)} / {pad(pics.length)}</span>
              </span>
              {/* a hairline that fills while each picture holds */}
              {pics.length > 1 && <span className="work__tick" key={`${current.project.slug}.${frame}`} style={{ animationDuration: `${HOLD}ms` }} />}
              <span className="work__open mono">View project<span aria-hidden="true"> →</span></span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
