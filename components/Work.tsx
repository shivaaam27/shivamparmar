'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Work as an index. The categories read as one sentence beside the title and double as the filter.
 * Below, a numbered list of projects; the frame beside it plays the hovered project's own pictures
 * one after another, like flicking through a contact sheet. A row or the frame opens the project.
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
    const id = setInterval(() => setFrame((f) => (f + 1) % pics.length), HOLD);
    return () => clearInterval(id);
  }, [onScreen, pics.length, current?.project.slug]);

  // switching project: the picture on show stays underneath while the new one fades in over it
  const [under, setUnder] = useState<string | null>(null);
  const choose = (i: number) => {
    if (i === active) return;
    setUnder(pics[frame]?.src ?? null);
    setActive(i); setFrame(0);
  };

  useEffect(() => {
    if (!under) return;
    const id = setTimeout(() => setUnder(null), 900);
    return () => clearTimeout(id);
  }, [under, active]);

  // once the section is near, fetch every project's first two pictures so a hover never waits
  const preloaded = useRef(false);
  useEffect(() => {
    if (!onScreen || preloaded.current) return;
    preloaded.current = true;
    entries.forEach(({ project }) => project.images?.slice(0, 2).forEach(({ src }) => { const im = new Image(); im.src = src; }));
  }, [onScreen]);

  return (
    <section ref={section} className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal">
          <Tag>{work.tag}</Tag>
          <Link className="work__title-link" href="/work" onClick={() => track('Open work page')}>{work.title}<span className="work__title-arrow" aria-hidden="true">↗</span></Link>
        </h2>
        {/* the categories as one sentence; each word filters, the chosen one again shows all */}
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
        <ol className="work__list" key={filter}>
          {shown.map((e, i) => {
            const on = e === current;
            const where = e.sub.name === e.project.title ? e.cat.name : `${e.cat.name} · ${e.sub.name}`;
            return (
              <li key={e.project.slug} className={`work__row${on ? ' is-active' : ''}`}>
                <Link
                  href={`/work/${e.project.slug}`}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
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
          <Link className="work__frame" href={`/work/${current.project.slug}`} aria-label={`Open ${current.project.title}`}
            onClick={() => track(`Open project · ${current.project.title}`)}>
            <span className="work__pics">
              {under && <img className="work__under" src={under} alt="" aria-hidden="true" />}
              {pics.map((pic, k) => (
                <img key={`${current.project.slug}-${pic.src}`} src={pic.src} alt={k === frame ? pic.alt : ''}
                  className={k === frame ? 'is-on' : undefined} loading="eager" />
              ))}
            </span>
            <span className="work__caption mono">
              <span>{current.project.title}</span>
              <span>{pad(frame + 1)} / {pad(pics.length)}</span>
            </span>
            {/* a hairline that fills while each picture holds */}
            {pics.length > 1 && <span className="work__tick" key={`${current.project.slug}.${frame}`} style={{ animationDuration: `${HOLD}ms` }} />}
            <span className="work__open mono">View project<span aria-hidden="true"> →</span></span>
          </Link>
        )}
      </div>
    </section>
  );
}
