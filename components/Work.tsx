'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
const total = entries.length;

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

  // ---- the moving stone: category marker and row lens, both on springs
  const pills = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const lens = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const mx = spring(0.15, 0.7), mw = spring(0.15, 0.7), ly = spring(0.17, 0.68), lh = spring(0.2, 0.68);
    const still = prefersReducedMotion();
    let raf = 0, first = true;
    const loop = () => {
      const on = pills.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      const row = list.current?.querySelector<HTMLElement>('.work__row.is-active');
      if (on) { mx.t = on.offsetLeft; mw.t = on.offsetWidth; }
      if (row) { ly.t = row.offsetTop; lh.t = row.offsetHeight; }
      if (first || still) { mx.jump(mx.t); mw.jump(mw.t); ly.jump(ly.t); lh.jump(lh.t); first = false; }
      const x = mx.step(), w = mw.step(), y = ly.step(), h = lh.step();
      // it stretches with its speed, like Blobby moving
      const sx = Math.min(0.25, Math.abs(mx.v) / 40), sy = Math.min(0.2, Math.abs(ly.v) / 50);
      if (mark.current) {
        mark.current.style.transform = `translateX(${x}px)`; mark.current.style.width = `${w * (1 + sx)}px`;
        if (on) { mark.current.style.top = `${on.offsetTop}px`; mark.current.style.height = `${on.offsetHeight}px`; }   // follows a wrapped row too
      }
      if (lens.current) { lens.current.style.transform = `translateY(${y}px) scaleY(${1 + sy}) scaleX(${1 - sy * 0.3})`; lens.current.style.height = `${h}px`; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- the frame: light on its rim, a little tilt, and where the next iris opens from
  const frameEl = useRef<HTMLAnchorElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const aimFrom = (clientX: number, clientY: number) => {
    const f = frameEl.current; if (!f) return;
    const r = f.getBoundingClientRect();
    const px = (clientX - r.left) / r.width, py = (clientY - r.top) / r.height;
    origin.current = { x: Math.max(0, Math.min(1, px)) * 100, y: Math.max(0, Math.min(1, py)) * 100 };
    return { px, py, r };
  };
  const onFrameMove = (e: React.PointerEvent) => {
    const a = aimFrom(e.clientX, e.clientY); const f = frameEl.current; if (!a || !f) return;
    f.style.setProperty('--mx', `${e.clientX - a.r.left}px`);
    f.style.setProperty('--my', `${e.clientY - a.r.top}px`);
    if (!prefersReducedMotion()) f.style.setProperty('--tilt', `rotateY(${(a.px - 0.5) * 7}deg) rotateX(${(0.5 - a.py) * 7}deg)`);
  };
  const onFrameLeave = () => frameEl.current?.style.setProperty('--tilt', 'none');
  const iris = origin.current ?? { x: 50, y: 50 };

  return (
    <section ref={section} className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal">
          <Tag>{work.tag}</Tag>
          <Link className="work__title-link" href="/work" onClick={() => track('Open work page')}>{work.title}<span className="work__title-arrow" aria-hidden="true">↗</span></Link>
        </h2>
        {/* categories: a capsule track; the stone marker springs to the one chosen */}
        <div className="work__pills reveal" data-delay="1" ref={pills} role="group" aria-label="Filter work by category">
          <span className="work__pill-mark stone" ref={mark} aria-hidden="true" />
          <button type="button" className="work__pill" aria-pressed={filter < 0} onClick={() => setFilter(-1)}>
            All<sup>{pad(total)}</sup>
          </button>
          {categories.map((cat, g) => (
            <button key={cat.slug} type="button" className="work__pill" aria-pressed={g === filter} onClick={() => setFilter(g === filter ? -1 : g)}>
              {cat.name}<sup>{pad(countCategory(cat))}</sup>
            </button>
          ))}
        </div>
      </div>

      <div className="work__body reveal" data-delay="2">
        <ol className="work__list" ref={list} style={{ '--rows': Math.max(shown.length, 6) } as React.CSSProperties}>
          <li className="work__lens stone" ref={lens} aria-hidden="true" />
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
          <Link className="work__frame stone" ref={frameEl} href={`/work/${current.project.slug}`} aria-label={`Open ${current.project.title}`}
            onClick={() => track(`Open project · ${current.project.title}`)} onPointerMove={onFrameMove} onPointerLeave={onFrameLeave}>
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
