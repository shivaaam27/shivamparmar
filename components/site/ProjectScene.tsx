'use client';

import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { tc } from '@/lib/title-case';
import { ProjectMedia, type ReelEntry } from './WorkIndex';
import Viewer, { type ViewShot } from './Viewer';

const pad = (n: number) => String(n).padStart(2, '0');
type Neighbour = { slug: string; title: string } | null;

/**
 * A project page (docs/SITE.md, "Work pages"): the project's picture or recording fills the screen (it morphs in
 * from the work page), with the title over a light shade and an Expand button that opens it full screen. It holds
 * while the information slides up over it, on the deep green: what it is, the longer description, the facts and the
 * live link. The way on (ProjectNav) comes after the green, on the paper.
 */
export function ProjectOpen({ e, index, total, facts, details, shots, lead, children }: {
  e: ReelEntry; index: number; total: number; facts: { label: string; value: React.ReactNode }[];
  details?: string[]; shots: ViewShot[]; lead: number; children?: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const close = useCallback(() => setViewing(null), []);
  const router = useRouter();
  const up = `/work/${e.categorySlug}`;
  // back: to the very spot this page was opened from (the browser keeps it); opened straight from a link or a search,
  // there is no such spot on this site, so back leads to the project's category instead
  const back = (ev: React.MouseEvent) => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const landedHere = nav && new URL(nav.name).pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '');
    if (landedHere || window.history.length < 2) return; // the link itself goes to the category
    ev.preventDefault();
    router.back();
  };

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const q = gsap.utils.selector(root.current!);
    (q('.v2-po__rise') as HTMLElement[]).forEach((item) => {
      gsap.fromTo(item, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 90%' } });
    });
  }, { scope: root });

  const meta = [tc(e.category), e.collection !== e.title ? tc(e.collection) : null].filter(Boolean).join(' · ');

  return (
    <section ref={root} className="v2-po" aria-label={e.title}>
      {/* the picture, held full screen */}
      <div className="v2-po__hero">
        <ProjectMedia e={e} priority />
        <span className="v2-po__shade" aria-hidden="true" />
        <div className="v2-po__say">
          <nav className="v2-po__crumbs" aria-label="Breadcrumb">
            <Link href={'/work'}>Work</Link><Link href={`/work/${e.categorySlug}`}>{tc(e.category)}</Link><span>{pad(index + 1)} / {pad(total)}</span>
          </nav>
          <h1 className="v2-po__title">{tc(e.title)}</h1>
        </div>
        <Link className="v2-po__back" href={up} onClick={back} aria-label="Back">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M19 12H6M11 6.5 5.5 12 11 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>Back</span>
        </Link>
        {shots.length > 0 && (
          <button type="button" className="v2-po__expand" onClick={() => { setViewing(lead); track(`Expand · ${e.title}`); }}
            aria-label={e.video ? 'Watch full screen' : 'View full screen'}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{e.video ? 'Watch full screen' : 'Full screen'}</span>
          </button>
        )}
      </div>

      {/* the information, sliding up over the picture */}
      <div className="v2-po__body v2-dark">
        <div className="v2-po__in">
          {meta && <p className="v2-po__meta v2-po__rise">{meta}</p>}
          {e.summary && <p className="v2-po__lead v2-po__rise">{e.summary}</p>}
          {details?.length ? <div className="v2-po__text v2-po__rise">{details.map((p, i) => <p key={i}>{p}</p>)}</div> : null}
          {facts.length > 0 && (
            <dl className="v2-po__facts v2-po__rise">
              {facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
          )}
          {children}
        </div>
      </div>
      {viewing !== null && createPortal(<Viewer shots={shots} start={viewing} onClose={close} />, document.querySelector('.v2') ?? document.body)}
    </section>
  );
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The end of a project page (or a journal post), on the paper: the previous one, all of them, the next one. */
export function ProjectNav({ prev, next, base = '/work', allLabel = 'All Work', prevLabel = 'Previous project', nextLabel = 'Next project' }: {
  prev: Neighbour; next: Neighbour; base?: string; allLabel?: string; prevLabel?: string; nextLabel?: string;
}) {
  return (
    <nav className="v2-pnav" aria-label="More work">
      <div className="v2-pnav__in">
        {prev ? (
          <Link className="v2-pnav__side" href={`${base}/${prev.slug}`} onClick={() => track(`${prevLabel} · ${prev.title}`)}>
            <span className="v2-pnav__icon"><Chevron flip /></span>
            <span className="v2-pnav__txt"><span className="v2-pnav__k">{prevLabel}</span><span className="v2-pnav__t">{tc(prev.title)}</span></span>
          </Link>
        ) : <span />}
        <Link className="v2-pnav__all" href={base}>{allLabel}</Link>
        {next ? (
          <Link className="v2-pnav__side is-next" href={`${base}/${next.slug}`} onClick={() => track(`${nextLabel} · ${next.title}`)}>
            <span className="v2-pnav__txt"><span className="v2-pnav__k">{nextLabel}</span><span className="v2-pnav__t">{tc(next.title)}</span></span>
            <span className="v2-pnav__icon"><Chevron /></span>
          </Link>
        ) : <span />}
      </div>
    </nav>
  );
}
