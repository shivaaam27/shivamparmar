'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/track';
import { tc } from '@/lib/title-case';
import { LOOP, THIN } from './Hero';
import { ArrowUR } from './Art';

export type Panel = { slug: string; href: string; title: string; short: string; offer: string[]; cover?: string; screen?: boolean };
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The services page (docs/SITE.md, "Services"): the title on the deep green with the loop line, then the services
 * as tall panels side by side, each over a picture of work it made. One is open at a time: pointing at, tapping or
 * tabbing to a panel opens it (what it is, what you get, a link to read more) while the others narrow to their number
 * and name. On phones the panels stack and open one at a time.
 */
export default function ServicesPanels({ title, lead, label, readMore, panels, areas }: {
  title: React.ReactNode; lead: string; label: string; readMore: string; panels: Panel[]; areas: string;
}) {
  const [open, setOpen] = useState(0);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  return (
    <>
      <section className={`v2-so v2-dark${drawn ? ' is-drawn' : ''}`} aria-labelledby="services-title">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-so__head">
          <p className="v2-so__k">{label}</p>
          <h1 id="services-title" className="v2-so__title">{title}</h1>
          <p className="v2-so__lead">{lead}</p>
        </div>
      </section>

      <section className="v2-sp" aria-label={label}>
        <ul className="v2-sp__row">
          {panels.map((p, i) => {
            const on = i === open;
            return (
              <li key={p.slug} className={`v2-sp__panel${on ? ' is-open' : ''}`} onMouseEnter={() => setOpen(i)} onFocusCapture={() => setOpen(i)}>
                {p.cover && <img className={`v2-sp__img${p.screen ? ' is-screen' : ''}`} src={p.cover} alt="" loading={i < 2 ? 'eager' : 'lazy'} />}
                <span className="v2-sp__shade" aria-hidden="true" />
                <button type="button" className="v2-sp__tab" onClick={() => setOpen(i)} aria-expanded={on} aria-controls={`svc-${p.slug}`}>
                  <span className="v2-sp__n">{pad(i + 1)}</span>
                  <span className="v2-sp__name">{tc(p.title)}</span>
                </button>
                <div id={`svc-${p.slug}`} className="v2-sp__body" hidden={!on}>
                  <h2 className="v2-sp__title">{tc(p.title)}</h2>
                  <p className="v2-sp__short">{p.short}</p>
                  <ul className="v2-sp__offer">{p.offer.slice(0, 4).map((o) => <li key={o}>{o}</li>)}</ul>
                  <Link className="v2-btn v2-btn--lime" href={p.href} onClick={() => track(`Service · ${p.title}`)}>{readMore}<span className="v2-btn__dot"><ArrowUR /></span></Link>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="v2-sp__areas">{areas}</p>
      </section>
    </>
  );
}
