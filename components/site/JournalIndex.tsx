'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { tc } from '@/lib/title-case';
import { copy } from '@/lib/copy';
import { LOOP, THIN } from './Hero';
import { ArrowUR } from './Art';
import Tabs from './Tabs';
import LangMenu from './LangMenu';
import { POST_LANGS, WORDS, LANG_NAMES, isRtl, type PostLang } from '@/lib/post-lang';

export type PostCard = { slug: string; title: string; description: string; date: string; dateText: string; lang: PostLang; tags: string[]; minutes: string; group: string };
const ALL = '__all';

/**
 * The journal (docs/SITE.md, "Journal"): the title with the opening light; the newest post as a large cover; then every
 * post as a row. Every post is shown once: the language button switches the whole list between the languages in place
 * (English first), and a post that exists in several languages is one entry, shown in the chosen language, else in
 * English. Topic narrows the list further.
 */
export default function JournalIndex({ posts }: { posts: PostCard[] }) {
  const [drawn, setDrawn] = useState(false);
  const [lang, setLang] = useState<PostLang>('en');
  const [tag, setTag] = useState<string>(ALL);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  // one entry per post: a group (the same post in several languages) shows in the chosen language, else in English
  const entries = useMemo(() => {
    const groups = new Map<string, PostCard[]>();
    for (const p of posts) groups.set(p.group, [...(groups.get(p.group) ?? []), p]);
    return Array.from(groups.values()).map((g) => g.find((x) => x.lang === lang) ?? g.find((x) => x.lang === 'en') ?? g[0]);
  }, [posts, lang]);
  const tags = useMemo(() => Array.from(new Set(entries.flatMap((p) => p.tags))).sort(), [entries]);
  const shown = entries.filter((p) => tag === ALL || p.tags.includes(tag));
  const chooseLang = (k: string) => { setLang(POST_LANGS.includes(k as PostLang) ? (k as PostLang) : 'en'); setTag(ALL); };
  // the languages the journal exists in, English first
  const languages = useMemo(() => POST_LANGS.filter((l) => posts.some((p) => p.lang === l)).map((code) => ({ code })), [posts]);
  const w = WORDS[lang];
  const [lead, ...rest] = shown;

  return (
    <>
      <section className={`v2-jo v2-dark${drawn ? ' is-drawn' : ''}`} aria-labelledby="journal-title">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-jo__head">
          <p className="v2-jo__k">{copy('journal.kicker', 'Makala')}</p>
          <h1 id="journal-title" className="v2-jo__title">{copy('journal.title', 'Journal')}</h1>
          <p className="v2-jo__lead">{copy('journal.lead')}</p>
        </div>
      </section>

      <section className="v2-jx" aria-label="Posts">
        <div className="v2-jx__in">
          <div className="v2-jx__filters">
            {languages.length > 1 && <LangMenu items={languages} current={lang} onSelect={chooseLang} />}
            {tags.length > 1 && (
              <Tabs soft label="Topic" value={tag} onChange={setTag}
                items={[{ key: ALL, label: w.everyTopic }, ...tags.map((t) => ({ key: t, label: lang === 'en' || lang === 'sw' ? (t.length <= 2 ? t.toUpperCase() : tc(t)) : lang === 'fr' ? (t.length <= 2 ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1)) : t }))]} />
            )}
          </div>

          {lead ? (
            <Link href={`/journal/${lead.slug}`} className="v2-jx__cover" lang={lead.lang} dir={isRtl(lead.lang) ? 'rtl' : undefined}>
              <svg className="v2-jx__line" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-40 380C200 330 330 420 520 360s300-230 470-170 160 170 260 120" pathLength={1} />
              </svg>
              <span className="v2-jx__meta"><b>{WORDS[lead.lang].latest}</b>{lead.dateText} · {LANG_NAMES[lead.lang]} · {lead.minutes}</span>
              <span className="v2-jx__title">{lead.lang === 'en' || lead.lang === 'sw' ? tc(lead.title) : lead.title}</span>
              <span className="v2-jx__text">{lead.description}</span>
              <span className="v2-jx__go">{WORDS[lead.lang].read} <ArrowUR /></span>
            </Link>
          ) : <p className="v2-jx__none">No posts here yet.</p>}

          {rest.length > 0 && (
            <ol className="v2-jx__list">
              {rest.map((p) => (
                <li key={p.slug} lang={p.lang} dir={isRtl(p.lang) ? 'rtl' : undefined}>
                  <Link href={`/journal/${p.slug}`} className="v2-jx__row">
                    <span className="v2-jx__date">{p.dateText}</span>
                    <span className="v2-jx__body"><b>{p.lang === 'en' || p.lang === 'sw' ? tc(p.title) : p.title}</b><span>{p.description}</span></span>
                    <span className="v2-jx__info">{LANG_NAMES[p.lang]} · {p.minutes}</span>
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
