'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { work } from '@/lib/content';
import { visibleCategories, countCategory, hasPage, coverOf } from '@/lib/work';
import { prefersReducedMotion } from '@/lib/motion';
import Tag from './Tag';
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
const readFilter = () => categories.findIndex((cat) => cat.slug === new URLSearchParams(window.location.search).get('c'));
function writeFilter(c: number) {
  const q = c >= 0 ? `?c=${categories[c].slug}` : '';
  window.history.pushState(null, '', `${window.location.pathname}${q}#work`);
}

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
  const [filter, setFilterState] = useState(-1);
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

  const setFilter = useCallback((c: number) => {
    track(c >= 0 ? `Filter · ${categories[c].name}` : 'Filter · All work');
    setFilterState(c); setActive(0); setFrame(0);
    writeFilter(c);
  }, []);

  const shown = useMemo(() => entries.filter((e) => filter < 0 || e.g === filter), [filter]);
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

  // ---- Blobby peeks up from the bottom line of the row you're on, sliding along with the pointer
  // and watching it; it sinks away when you leave the list
  const list = useRef<HTMLOListElement>(null);
  const peek = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const ol = list.current, el = peek.current; if (!ol || !el) return;
    const eyes = el.querySelector<HTMLElement>('.work__peek-eyes');
    const px = spring(0.12, 0.72), py = spring(0.17, 0.68), up = spring(0.14, 0.66);
    const still = prefersReducedMotion();
    let pointer: { x: number; y: number } | null = null, inside = false, raf = 0, first = true;
    const move = (e: PointerEvent) => { pointer = { x: e.clientX, y: e.clientY }; inside = true; };
    const leave = () => { inside = false; };
    ol.addEventListener('pointermove', move);
    ol.addEventListener('pointerleave', leave);
    const loop = () => {
      const row = ol.querySelector<HTMLElement>('.work__row.is-active');
      const box = ol.getBoundingClientRect();
      if (row) py.t = row.offsetTop + row.offsetHeight;                       // sits on the row's bottom line
      if (pointer) px.t = Math.max(24, Math.min(box.width - 24, pointer.x - box.left));
      up.t = inside ? 1 : 0;
      if (first || still) { px.jump(px.t || box.width * 0.6); py.jump(py.t); first = false; }
      const x = px.step(), y = py.step(), u = up.step();
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.setProperty('--up', String(Math.max(0, Math.min(1.15, u))));
      // eyes look at the pointer
      if (eyes && pointer) {
        const r = eyes.getBoundingClientRect();
        const dx = pointer.x - (r.left + r.width / 2), dy = pointer.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 160);
        eyes.style.transform = `translate(${(dx / d) * k * 3.5}px, ${(dy / d) * k * 2.5}px)`;
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
        {/* the categories as one sentence; each word filters (again: all). The one chosen, or pointed
            at, gets Blobby's highlighter stroke */}
        <p className="work__index reveal" data-delay="1">
          {categories.map((cat, g) => (
            <Fragment key={cat.slug}>
              <span>
                <em>{g === 0 ? 'From' : 'to'}</em>{' '}
                <button type="button" className={g === filter ? 'is-active' : undefined} aria-pressed={g === filter}
                  onClick={() => setFilter(g === filter ? -1 : g)}>
                  {cat.name}<sup className="mono">{pad(countCategory(cat))}</sup>
                </button>
                {g < categories.length - 1 ? ',' : '.'}
              </span>{' '}
            </Fragment>
          ))}
          {filter >= 0 && (
            <button type="button" className="work__back mono" onClick={() => setFilter(-1)}>
              <span aria-hidden="true">← </span>All work
            </button>
          )}
        </p>
      </div>

      <div className="work__body reveal" data-delay="2">
        <ol className="work__list" ref={list} style={{ '--rows': Math.max(shown.length, 6) } as React.CSSProperties}>
          <li className="work__peek" ref={peek} aria-hidden="true"><span className="work__peek-body"><span className="work__peek-eyes"><i /><i /></span></span></li>
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
