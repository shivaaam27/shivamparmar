'use client';

import { useState } from 'react';
import Link from 'next/link';
import { aboutPage } from '@/lib/content';
import { tc, v2 } from '@/lib/v2';
import { ArrowUR } from './Art';
import { Kicker } from './Ui';

/** Where each discipline leads. */
const HREF: Record<string, string> = {
  'Systems & apps': '/services/custom-software',
  'AI & prompt engineering': '/services/ai-automation',
  Design: '/services/branding-and-social-media',
  Photography: '/work/photography',
  Pharmacy: '/about#experience',
};
const first = (t: string) => t.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? t;

/**
 * What I do, as an index: five rows divided by fine rules, each with its number, its name and one line.
 * Pointing at a row tints it lime; on phones each row shows a small photo.
 */
export default function V2Disciplines({ n = 2 }: { n?: number }) {
  const { disciplines, disciplinesTag } = aboutPage;
  const [on, setOn] = useState<number | null>(null);

  return (
    <section className="v2-sec v2-disc" aria-label={disciplinesTag} data-reveal>
      <div className="v2-wrap">
        <Kicker n={n}>{disciplinesTag}</Kicker>
        <div className="v2-disc__head">
          <h2 className="v2-h2 v2-rise">{tc('Five disciplines,')} <em>{tc('one way of working.', { start: false })}</em></h2>
          <Link className="v2-more v2-rise" style={{ '--d': 1 } as React.CSSProperties} href={v2('/services')}>All services <ArrowUR /></Link>
        </div>
        <ol className="v2-disc__list" onPointerLeave={() => setOn(null)}>
          {disciplines.map((d, i) => (
            <li key={d.title} className="v2-rise" style={{ '--d': i + 1 } as React.CSSProperties}>
              <Link href={v2(HREF[d.title] ?? '/services')} className={`v2-disc__row${on === i ? ' is-on' : ''}`} onPointerEnter={() => setOn(i)} onFocus={() => setOn(i)} onBlur={() => setOn(null)}>
                <span className="v2-disc__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="v2-disc__title">{tc(d.title)}</span>
                <span className="v2-disc__text">{first(d.text)}</span>
                {d.image && <span className="v2-disc__thumb" aria-hidden="true"><img src={d.image} alt="" loading="lazy" /></span>}
                <span className="v2-disc__go" aria-hidden="true"><ArrowUR /></span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
