'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useLenis } from 'lenis/react';
import Link from 'next/link';
import { claimPops, pushPage } from '@/components/SmoothScroll';
import { track } from '@/lib/track';
import { srcSet } from '@/lib/thumb';
import { tc } from '@/lib/title-case';
import Viewer from './Viewer';
import { ArrowUR } from './Art';
import Ribbons from './Ribbons';
import Tabs from './Tabs';
import V2Wheel from './Wheel';
import { Masonry, ShotTile } from './Shots';

const ALL = '__all';

/** The same shapes lib/work-data.ts makes for the work page. */
export type Shot = { src: string; alt: string; w: number; h: number; project: string; slug: string; n: number; video?: string; screen?: boolean; linked?: boolean; compare?: { video: string; poster: string; label: string; otherLabel: string } };
export type Collection = { slug: string; name: string; shots: Shot[]; page?: string; summary?: string };
export type Cat = { slug: string; name: string; collections: Collection[] };

type Kind = 'photos' | 'videos';
type Sel = { c: string | null; s: string | null; t?: Kind | null };
const isKind = (k: string | null): k is Kind => k === 'photos' || k === 'videos';
const ofKind = (t: Kind) => (p: Shot) => (t === 'videos' ? Boolean(p.video) : !p.video);

/** /work → all, /work/photography → a category, ?s=mikumi → one collection, ?t=videos → just the videos. */
function readSel(cats: Cat[]): Sel {
  const parts = window.location.pathname.replace(/\/+$/, '').split('/');
  const seg = parts[parts.indexOf('work') + 1] ?? null;
  const cat = cats.find((c) => c.slug === seg);
  const q = new URLSearchParams(window.location.search);
  const s = q.get('s'), t = q.get('t');
  return { c: cat?.slug ?? null, s: cat?.collections.some((x) => x.slug === s) ? s : null, t: cat && isKind(t) ? t : null };
}
const pathOf = ({ c, s, t }: Sel) => {
  const q = new URLSearchParams();
  if (c && s) q.set('s', s);
  if (c && t) q.set('t', t);
  const qs = q.toString();
  return `${'/work'}${c ? `/${c}` : ''}${qs ? `?${qs}` : ''}`;
};

/**
 * Work page: a green band with the title and the chosen collection's words, a bar of pills to choose a
 * category, a collection and photos or videos (it stays at hand while you scroll), then the work: screens in
 * browser frames, and every photo in a rounded masonry grid. A picture opens the full-screen viewer.
 */
export default function V2WorkBrowser({ cats, initial, archive }: { cats: Cat[]; initial: Sel; archive?: boolean }) {
  const [sel, setSel] = useState<Sel>(initial);
  const [viewing, setViewing] = useState<number | null>(null);
  // the slim tab bar shows once the wheels in the green band have scrolled out of view
  const [stuck, setStuck] = useState(false);
  // (archive: the filters themselves stick; "stuck" is when the line just above them has gone under the header)
  useEffect(() => {
    const el = document.querySelector(archive ? '.v2-wf__sentinel' : '.v2-whero');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0),
      archive ? { rootMargin: '-96px 0px 0px 0px' } : undefined);
    io.observe(el);
    return () => io.disconnect();
  }, [archive]);
  const lenis = useLenis();
  const closeViewer = useCallback(() => setViewing(null), []);

  useEffect(() => {
    const sync = () => setSel(readSel(cats));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [cats]);

  // back and forward between filters: the earlier choice comes back at once, then the page returns to exactly where it
  // was on it, again each time the grid still grows while it lays out (pictures, measured columns), until the visitor
  // moves or it has settled
  useEffect(() => claimPops((to) => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/');
    if (parts[1] !== 'work' || parts.length > 3 || (parts[2] && !cats.some((c) => c.slug === parts[2]))) return false;
    const next = readSel(cats);
    flushSync(() => setSel(next));
    const c = cats.find((x) => x.slug === next.c);
    document.title = `${c?.collections.find((x) => x.slug === next.s)?.name ?? c?.name ?? 'Work'} — Shivo Labs`;
    let done = false;
    let late: ReturnType<typeof setTimeout> | undefined;
    const stopOn = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    const jump = () => {
      if (done) return;
      if (lenis) { lenis.resize(); lenis.scrollTo(to, { immediate: true, force: true }); }
      else window.scrollTo({ top: to, behavior: 'instant' });
    };
    const grows = new ResizeObserver(() => jump());
    const finish = () => {
      done = true;
      grows.disconnect();
      clearTimeout(late);
      stopOn.forEach((t) => window.removeEventListener(t, finish));
    };
    stopOn.forEach((t) => window.addEventListener(t, finish, { passive: true }));
    jump();
    grows.observe(document.body);
    requestAnimationFrame(() => { jump(); requestAnimationFrame(jump); });
    late = setTimeout(() => { jump(); finish(); }, 1200);
    return true;
  }), [cats, lenis]);

  const choose = useCallback((next: Sel) => {
    const c = cats.find((x) => x.slug === next.c);
    const s = c?.collections.find((x) => x.slug === next.s);
    track(c ? `Work · ${c.name}${s ? ` › ${s.name}` : ''}` : 'Work · All');
    // (the place on the filter being left is kept, so back returns to it)
    pushPage(pathOf(next));
    document.title = `${s?.name ?? c?.name ?? 'Work'} — Shivo Labs`;
    const apply = () => {
      flushSync(() => setSel(next));
      // past the filters, the grid goes back to its start (under the filters) so the new choice is seen from its top
      const mark = document.querySelector<HTMLElement>('.v2-wf__sentinel');
      if (mark) {
        const top = mark.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > top) lenis?.scrollTo(top - 8, { immediate: true, force: true });
      } else {
        const bar = document.querySelector<HTMLElement>('.v2-wbar');
        if (bar && window.scrollY > bar.offsetTop) lenis?.scrollTo(bar.offsetTop - 8, { immediate: true, force: true });
      }
    };
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (vt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) vt.call(document, apply);
    else apply();
  }, [cats, lenis]);

  const cat = cats.find((c) => c.slug === sel.c) ?? null;
  const col = cat?.collections.find((x) => x.slug === sel.s) ?? null;
  const inCol = useMemo(() => (cat ? [cat] : cats).flatMap((c) => c.collections.filter((x) => !col || x === col).flatMap((x) => x.shots)), [cats, cat, col]);
  const shots = useMemo(() => (sel.t ? inCol.filter(ofKind(sel.t)) : inCol), [inCol, sel.t]);
  // systems, tools and websites: with several projects on show, each project's screens become one stacked
  // card that opens its page; one project chosen shows every screen
  const items = useMemo(() => {
    const out: ({ kind: 'shot'; p: Shot; i: number } | { kind: 'stack'; ps: Shot[] })[] = [];
    const stacks = new Map<string, Shot[]>();
    shots.forEach((p, i) => {
      // under the project wall (archive) every picture is just a picture: the project cards would repeat the wall
      if (archive || col || !p.linked) return void out.push({ kind: 'shot', p, i });
      const ps = stacks.get(p.slug);
      if (ps) return void ps.push(p);
      const fresh = [p];
      stacks.set(p.slug, fresh);
      out.push({ kind: 'stack', ps: fresh });
    });
    const rank = (p: Shot) => (p.w > p.h ? (p.screen ? 0 : 1) : 2);
    return out.map((it) => {
      if (it.kind !== 'stack') return it;
      if (it.ps.length === 1) return { kind: 'shot' as const, p: it.ps[0], i: shots.indexOf(it.ps[0]) };
      return { kind: 'stack' as const, ps: [...it.ps].sort((a, b) => rank(a) - rank(b)) };
    });
  }, [shots, col, archive]);
  const isWide = (it: (typeof items)[number]) => !archive && (it.kind === 'stack' || (it.p.screen && it.p.w > it.p.h));
  const wide = items.filter(isWide), rest = items.filter((it) => !isWide(it));
  const hasVideo = Boolean(cat?.collections.some((x) => x.shots.some((p) => p.video)));
  const count = (c: Cat) => c.collections.reduce((n, x) => n + x.shots.length, 0);
  // a category of words only (software) counts its collections instead
  const tabCount = (c: Cat) => count(c) || c.collections.length;
  // collections with a description and no pictures yet, listed under a chosen category
  const notes = cat ? cat.collections.filter((x) => !x.shots.length && x.summary && (!col || x === col)) : [];
  const title = tc(col?.name ?? cat?.name ?? 'Work');

  // the filters: category, then the chosen category's collections and photos or videos
  const filters = (
    <>
      <Tabs label="Category" value={sel.c ?? ALL} onChange={(k) => choose({ c: k === ALL ? null : k, s: null })}
            items={[{ key: ALL, label: 'All', count: cats.reduce((n, c) => n + count(c), 0) }, ...cats.map((c) => ({ key: c.slug, label: tc(c.name), count: tabCount(c) }))]} />
          {cat && (cat.collections.length > 1 || hasVideo) && (
            <div className="v2-wbar__sub">
              {cat.collections.length > 1 && (
                <Tabs soft label={cat.name} value={sel.s ?? ALL} onChange={(k) => choose({ c: cat.slug, s: k === ALL ? null : k, t: sel.t })}
                  items={[{ key: ALL, label: tc(`All ${cat.name.toLowerCase()}`) }, ...cat.collections.map((x) => ({ key: x.slug, label: tc(x.name), disabled: !x.shots.length && !x.summary }))]} />
              )}
              {hasVideo && (
                <Tabs soft label="Type" value={sel.t ?? ALL} onChange={(k) => choose({ c: cat.slug, s: sel.s, t: isKind(k) ? k : null })}
                  items={[{ key: ALL, label: 'Photos & videos' }, { key: 'photos', label: 'Photos' }, { key: 'videos', label: 'Videos' }]} />
              )}
            </div>
          )}
    </>
  );

  return (
    <div className="v2-wb">
      {/* archive: under the wall, only the filters, centred; they stick while the pictures scroll and lift to the front */}
      {archive && (
        <>
          <div className="v2-wf__sentinel" id="every-picture" aria-hidden="true" />
          <div className="v2-wf">
            <div className={`v2-wf__in${stuck ? ' is-stuck' : ''}`}>{filters}</div>
          </div>
        </>
      )}
      {!archive && <>
      <section className="v2-whero v2-dark" id="every-picture" data-reveal>
        <Ribbons set="page" className="v2-whero__lines" />
        <div className="v2-wrap v2-whero__grid">
        <div className="v2-whero__in">
          <nav className="v2-crumbs v2-rise" aria-label="Breadcrumb">
            <Link href={'/'}>Home</Link>
            {cat ? <button type="button" onClick={() => choose({ c: null, s: null })}>Work</button> : <span aria-current="page">Work</span>}
            {cat && (col ? <button type="button" onClick={() => choose({ c: cat.slug, s: null })}>{tc(cat.name)}</button> : <span aria-current="page">{tc(cat.name)}</span>)}
            {col && <span aria-current="page">{tc(col.name)}</span>}
          </nav>
          <h1 className="v2-h1 v2-whero__title v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{title}</h1>
          {col?.summary && <p className="v2-lead v2-whero__lead">{col.summary}</p>}
          {col?.page && <Link className="v2-btn v2-btn--small" href={col.page}>About this project<span className="v2-btn__dot"><ArrowUR /></span></Link>}
          {!cat && <p className="v2-lead v2-whero__lead v2-rise" style={{ '--d': 2 } as React.CSSProperties}>Systems, tools, websites, photography and social media, from Dar es Salaam.</p>}
        </div>
        {/* Picker wheels: category, collection, photos or videos */}
        <div className="v2-wheels v2-whero__wheels v2-rise" style={{ '--d': 2 } as React.CSSProperties}>
          <V2Wheel label="Category" value={sel.c ?? ALL} onChange={(k) => choose({ c: k === ALL ? null : k, s: null })}
            items={[{ key: ALL, label: 'All', count: cats.reduce((n, c) => n + count(c), 0) }, ...cats.map((c) => ({ key: c.slug, label: tc(c.name), count: tabCount(c) }))]} />
          {cat && cat.collections.length > 1 && (
            <V2Wheel key={cat.slug} label={tc(cat.name)} value={sel.s ?? ALL} onChange={(k) => choose({ c: cat.slug, s: k === ALL ? null : k, t: sel.t })}
              items={[{ key: ALL, label: 'All', count: count(cat) }, ...cat.collections.map((x) => ({ key: x.slug, label: tc(x.name), count: x.shots.length || undefined, disabled: !x.shots.length && !x.summary }))]} />
          )}
          {cat && hasVideo && (
            <V2Wheel key={`${cat.slug}-t`} label="Type" rows={3} value={sel.t ?? ALL} onChange={(k) => choose({ c: cat.slug, s: sel.s, t: isKind(k) ? k : null })}
              items={[{ key: ALL, label: 'All' }, { key: 'photos', label: 'Photos' }, { key: 'videos', label: 'Videos' }]} />
          )}
        </div>
        </div>
      </section>

      <div className={`v2-wbar${stuck ? ' is-on' : ''}`} aria-hidden={!stuck} inert={!stuck}>
        <div className="v2-wbar__in">{filters}</div>
      </div>
      </>}

      <div className="v2-wrap v2-wgrid-wrap">
        {shots.length ? (
          <>
            {/* systems, tools and websites first: clean screen cards, three across */}
            {wide.length > 0 && (
              <ul className="v2-screens">
                {wide.map((it) => {
                  const lead = it.kind === 'stack' ? it.ps[0] : it.p;
                  const n = it.kind === 'stack' ? it.ps.length : 1;
                  const page = `/work/${lead.slug}`;
                  const media = (
                    <span className="v2-screen__media">
                      <img src={lead.src} srcSet={srcSet(lead.src, lead.w)} sizes="(max-width: 720px) 100vw, 33vw" alt={lead.alt} loading="eager" />
                      {lead.video && <video src={lead.video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
                      {lead.video && <span className="v2-shot__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>}
                      {n > 1 && <span className="v2-screen__count">{n} screens</span>}
                    </span>
                  );
                  return (
                    <li key={lead.src} className="v2-screen">
                      {it.kind === 'stack' ? (
                        <Link href={page} className="v2-screen__open" onClick={() => track(`Open project · ${lead.project}`)} aria-label={`${lead.project}: ${n} screens. Open the project`}>{media}</Link>
                      ) : (
                        <button type="button" className="v2-screen__open" onClick={() => { setViewing(it.i); track(`View ${lead.video ? 'video' : 'photo'} · ${lead.project}`); }} aria-label={`View ${lead.project}: ${lead.alt}`}
                          onPointerEnter={lead.video ? (e) => { if (e.pointerType === 'mouse') e.currentTarget.querySelector('video')?.play().catch(() => {}); } : undefined}
                          onPointerLeave={lead.video ? (e) => { const vid = e.currentTarget.querySelector('video'); if (vid) { vid.pause(); vid.currentTime = 0; } } : undefined}>
                          {media}
                        </button>
                      )}
                      <p className="v2-screen__cap">
                        <b>{lead.project}</b>
                        {(it.kind === 'stack' || lead.linked) && <Link className="v2-screen__go" href={page} onClick={() => track(`Open project · ${lead.project}`)} aria-label={`Open ${lead.project}`}><ArrowUR /></Link>}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {/* photos and phone screens: a balanced masonry grid */}
            {rest.length > 0 && (
              <Masonry items={rest.flatMap((it) => (it.kind === 'shot' ? [it.p] : []))} className={wide.length ? 'is-after' : ''}
                render={(p, k) => (
                  <ShotTile shot={p} label={p.project} eager={k < 8}
                    onOpen={() => { setViewing(shots.indexOf(p)); track(`View ${p.video ? 'video' : 'photo'} · ${p.project}`); }} />
                )} />
            )}
          </>
        ) : notes.length ? null : <p className="v2-lead v2-wgrid__empty">Coming soon.</p>}
        {notes.length > 0 && (
          <ul className="v2-notes" aria-label={cat ? tc(cat.name) : undefined}>
            {notes.map((x) => (
              <li key={x.slug} id={x.slug}><h3>{tc(x.name)}</h3><p>{x.summary}</p></li>
            ))}
          </ul>
        )}
      </div>

      {/* on the site root, above the header (inside <main> it would sit under it) and with the site fonts and colours */}
      {viewing !== null && createPortal(<Viewer shots={shots} start={viewing} onClose={closeViewer} />, document.querySelector('.v2') ?? document.body)}
    </div>
  );
}
