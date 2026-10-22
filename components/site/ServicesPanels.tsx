'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/track';
import { tc } from '@/lib/title-case';
import { LOOP, THIN } from './Hero';
import { ArrowUR } from './Art';

export type Panel = { slug: string; href: string; title: string; short: string };
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The services (docs/SITE.md, "Services"), on the About page and the Kiswahili services page: the title on the deep
 * green with the loop line, then each service in plain words (its name, what it is, a link to read more) and where we work.
 */
export default function ServicesPanels({ title, lead, label, readMore, panels, areas, level: H = 'h1' }: {
  title: React.ReactNode; lead: string; label: string; readMore: string; panels: Panel[]; areas: string; level?: 'h1' | 'h2';
}) {
  const Sub = H === 'h1' ? 'h2' : 'h3';
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
          <H id="services-title" className="v2-so__title">{title}</H>
          <p className="v2-so__lead">{lead}</p>
        </div>
      </section>

      <section className="v2-sp" aria-label={label}>
        <ol className="v2-sp__list">
          {panels.map((p, i) => (
            <li key={p.slug} className="v2-sp__item">
              <span className="v2-sp__n">{pad(i + 1)}</span>
              <Sub className="v2-sp__title">{tc(p.title)}</Sub>
              <p className="v2-sp__short">{p.short}</p>
              <Link className="v2-more" href={p.href} onClick={() => track(`Service · ${p.title}`)}>{readMore} <ArrowUR /></Link>
            </li>
          ))}
        </ol>
        <p className="v2-sp__areas">{areas}</p>
      </section>
    </>
  );
}
