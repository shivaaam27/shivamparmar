import LangMenu from './LangMenu';
import Link from 'next/link';
import { areas, services, type Lang } from '@/lib/services';
import { posts as allPosts, readingTime, versionsOf, type Post } from '@/lib/journal';
import { LANG_NAMES, LOCALE, WORDS, isRtl, type PostLang } from '@/lib/post-lang';
import { tc } from '@/lib/title-case';
import { JsonLd, Page, UI } from './Kit';
import { breadcrumbs, graph, postLd, serviceLd } from '@/lib/schema';
import ReadingBar from './ReadingBar';
import ServicesPanels from './ServicesPanels';
import JournalIndex from './JournalIndex';
import Article from './Article';
import { ProjectNav } from './ProjectScene';
import { LOOP, THIN } from './Hero';

const dateFmt = (d: string, lang: PostLang) => new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

/** Every service in plain words, on the About page. */
export function ServicesBlock({ lang, level = 'h1' }: { lang: Lang; level?: 'h1' | 'h2' }) {
  const t = UI[lang];
  const title = lang === 'sw'
    ? <>{tc('Huduma za kidijitali')} <em>{tc('kwa biashara Tanzania na Afrika Mashariki', { start: false })}</em></>
    : <>{tc('Digital services')} <em>{tc('for businesses in Tanzania and East Africa', { start: false })}</em></>;
  const lead = lang === 'sw'
    ? 'Shivo Labs ni kampuni ya suluhisho za kidijitali jijini Dar es Salaam. Tunajenga tovuti na programu, mifumo ya biashara, AI na otomatiki, na chapa zinazovutia.'
    : 'Shivo Labs is a digital solutions company in Dar es Salaam. We build websites and apps, business systems, AI workflows and automation, and brands that stand out.';
  const panels = services.map((s) => ({ slug: s.slug, title: s[lang].title, short: s[lang].short }));
  return <ServicesPanels title={title} lead={lead} label={t.services} panels={panels} areas={areas[lang]} level={level} />;
}

/** The services' search data, for the page that shows them in English (About). */
export function ServicesLd() {
  return <JsonLd data={graph(...services.map((sv) => serviceLd(sv, 'en', '/about')))} />;
}

/** /journal: the opening, the newest post as a cover, every post in rows with language and topic filters. */
export function JournalView({ posts }: { posts: Post[] }) {
  const cards = posts.map((p) => ({
    slug: p.slug, title: p.title, description: p.description, date: p.date, dateText: dateFmt(p.date, p.lang), lang: p.lang, tags: p.tags, group: p.group,
    minutes: WORDS[p.lang].minutes(readingTime(p)),
  }));
  return (
    <Page lang="en" className="v2-journal v3">
      <JsonLd data={graph(breadcrumbs([{ name: UI.en.home, path: '/' }, { name: UI.en.journal, path: '/journal' }]))} />
      <JournalIndex posts={cards} />
    </Page>
  );
}

/**
 * One journal post: the title on the deep green, then the text on the paper in one calm column with the contents list
 * and the text size beside it, a progress line along the top, and at the end the other language, the next post and
 * all posts.
 */
export function PostView({ post: p }: { post: Post }) {
  const t = WORDS[p.lang];
  const dir = isRtl(p.lang) ? 'rtl' : undefined;
  // the way on stays in the post's own language
  const list = allPosts().filter((x) => x.lang === p.lang);
  const at = list.findIndex((x) => x.slug === p.slug);
  const older = list[at + 1] ?? null, newer = at > 0 ? list[at - 1] : null;
  const versions = versionsOf(p);
  const others = versions.filter((x) => x !== p);
  return (
    <Page lang={p.lang} className="v2-postp v3">
      <JsonLd data={graph(postLd(p), breadcrumbs([{ name: t.home, path: '/' }, { name: t.journal, path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }]))} />
      <ReadingBar />
      <header className="v2-ph v2-dark">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
          <path className="v2-hloop__run" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-ph__in">
          <nav className="v2-ph__crumbs" aria-label={t.breadcrumb}>
            <Link href={'/journal'}>{dir ? '→' : '←'} {t.journal}</Link>
            {others.length > 0 && <LangMenu align="right" current={p.lang} items={versions.map((x) => ({ code: x.lang, href: `/journal/${x.slug}` }))} />}
          </nav>
          <p className="v2-ph__meta" dir={dir}>{dateFmt(p.date, p.lang)} · {t.minutes(readingTime(p))}{p.tags.length > 0 && <> · {p.tags.map((x) => tc(x)).join(', ')}</>}</p>
          <h1 className="v2-ph__title" dir={dir}>{p.lang === 'en' || p.lang === 'sw' ? tc(p.title) : p.title}</h1>
          <p className="v2-ph__dek" dir={dir}>{p.description}</p>
          <p className="v2-ph__by">Shivam Parmar, Shivo Labs</p>
        </div>
      </header>
      <article className="v2-pa" aria-label={p.title}>
        <Article html={p.html} toc={p.toc} lang={p.lang} />
        <div className="v2-pa__end">
          <p className="v2-post__end" aria-hidden="true">✳</p>
          {others.length > 0 && (
            <p className="v2-pa__pair" dir={dir}>
              {t.alsoIn}{' '}
              {others.map((x, i) => (
                <span key={x.slug}>{i > 0 && ' · '}<Link className="v2-link" href={`/journal/${x.slug}`} hrefLang={x.lang} lang={x.lang}>{LANG_NAMES[x.lang]}</Link></span>
              ))}
            </p>
          )}
        </div>
      </article>
      <ProjectNav base="/journal" allLabel={t.allPosts} prevLabel={t.newer} nextLabel={t.older}
        prev={newer && { slug: newer.slug, title: newer.title }} next={older && { slug: older.slug, title: older.title }} />
    </Page>
  );
}
