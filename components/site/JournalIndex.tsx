'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { tc } from '@/lib/title-case';
import { LOOP, THIN } from './Hero';
import { ArrowUR } from './Art';
import Tabs from './Tabs';

export type PostCard = { slug: string; title: string; description: string; date: string; dateText: string; lang: 'en' | 'sw'; tags: string[]; minutes: string };
const ALL = '__all';

/**
 * The journal (docs/SITE.md, "Journal"): the title on the deep green with the loop line; the newest post as a
 * large cover on the paper, the line drawing in behind it; then every post as a row, which language and topic can
 * narrow down. Reading is the point, so the motion stays at the edges.
 */
export default function JournalIndex({ posts }: { posts: PostCard[] }) {
  const [drawn, setDrawn] = useState(false);
  const [lang, setLang] = useState<string>(ALL);
  const [tag, setTag] = useState<string>(ALL);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);
  const shown = posts.filter((p) => (lang === ALL || p.lang === lang) && (tag === ALL || p.tags.includes(tag)));
  const [lead, ...rest] = shown;

  return (
    <>
      <section className={`v2-jo v2-dark${drawn ? ' is-drawn' : ''}`} aria-labelledby="journal-title">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-jo__head">
          <p className="v2-jo__k">Journal · Makala</p>
          <h1 id="journal-title" className="v2-jo__title">{tc('Notes on websites, systems and AI')} <em>{tc('for businesses in Africa', { start: false })}</em></h1>
          <p className="v2-jo__lead">Plain guides from Shivo Labs in Dar es Salaam, in English and Kiswahili.</p>
        </div>
      </section>

      <section className="v2-jx" aria-label="Posts">
        <div className="v2-jx__in">
          <div className="v2-jx__filters">
            <Tabs label="Language" value={lang} onChange={setLang}
              items={[{ key: ALL, label: 'All', count: posts.length }, { key: 'en', label: 'English' }, { key: 'sw', label: 'Kiswahili' }]} />
            {tags.length > 1 && (
              <Tabs soft label="Topic" value={tag} onChange={setTag}
                items={[{ key: ALL, label: 'Every topic' }, ...tags.map((t) => ({ key: t, label: t.length <= 2 ? t.toUpperCase() : tc(t) }))]} />
            )}
          </div>

          {lead ? (
            <Link href={`/journal/${lead.slug}`} className="v2-jx__cover" lang={lead.lang}>
              <svg className="v2-jx__line" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-40 380C200 330 330 420 520 360s300-230 470-170 160 170 260 120" pathLength={1} />
              </svg>
              <span className="v2-jx__meta"><b>Latest</b>{lead.dateText} · {lead.lang === 'sw' ? 'Kiswahili' : 'English'} · {lead.minutes}</span>
              <span className="v2-jx__title">{tc(lead.title)}</span>
              <span className="v2-jx__text">{lead.description}</span>
              <span className="v2-jx__go">{lead.lang === 'sw' ? 'Soma' : 'Read'} <ArrowUR /></span>
            </Link>
          ) : <p className="v2-jx__none">No posts here yet.</p>}

          {rest.length > 0 && (
            <ol className="v2-jx__list">
              {rest.map((p) => (
                <li key={p.slug} lang={p.lang}>
                  <Link href={`/journal/${p.slug}`} className="v2-jx__row">
                    <span className="v2-jx__date">{p.dateText}</span>
                    <span className="v2-jx__body"><b>{tc(p.title)}</b><span>{p.description}</span></span>
                    <span className="v2-jx__info">{p.lang === 'sw' ? 'Kiswahili' : 'English'} · {p.minutes}</span>
                    <span className="v2-jx__arrow" aria-hidden="true"><ArrowUR /></span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
