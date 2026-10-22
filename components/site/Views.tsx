import Link from 'next/link';
import { areas, services, type Lang, type Service } from '@/lib/services';
import { faq } from '@/lib/faq';
import { coverOf, findProject } from '@/lib/work';
import { posts as allPosts, readingTime, type Post } from '@/lib/journal';
import { tc } from '@/lib/title-case';
import { JsonLd, LinkCard, Page, PageHero, Section, UI, home, pad, paths } from './Kit';
import { breadcrumbs, faqLd, graph, postLd, serviceLd } from '@/lib/schema';
import Faq from './Faq';
import ReadingBar from './ReadingBar';
import ServicesPanels from './ServicesPanels';
import JournalIndex from './JournalIndex';
import Article from './Article';
import { ProjectNav } from './ProjectScene';
import { LOOP, THIN } from './Hero';

const svcPath = (s: Service, lang: Lang) => (lang === 'sw' ? `/sw/huduma/${s.swSlug}` : `/services/${s.slug}`);
const dateFmt = (d: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

/** Every service in plain words: on the About page (English) and /sw/huduma (Kiswahili). */
export function ServicesBlock({ lang, level = 'h1' }: { lang: Lang; level?: 'h1' | 'h2' }) {
  const t = UI[lang];
  const title = lang === 'sw'
    ? <>{tc('Huduma za kidijitali')} <em>{tc('kwa biashara Tanzania na Afrika Mashariki', { start: false })}</em></>
    : <>{tc('Digital services')} <em>{tc('for businesses in Tanzania and East Africa', { start: false })}</em></>;
  const lead = lang === 'sw'
    ? 'Shivo Labs ni kampuni ya suluhisho za kidijitali jijini Dar es Salaam. Tunajenga tovuti na programu, mifumo ya biashara, AI na otomatiki, na chapa zinazovutia.'
    : 'Shivo Labs is a digital solutions company in Dar es Salaam. We build websites and apps, business systems, AI workflows and automation, and brands that stand out.';
  const panels = services.map((s) => ({ slug: s.slug, href: svcPath(s, lang), title: s[lang].title, short: s[lang].short }));
  return <ServicesPanels title={title} lead={lead} label={t.services} readMore={lang === 'sw' ? 'Soma zaidi' : 'Read more'} panels={panels} areas={areas[lang]} level={level} />;
}

/** /sw/huduma: the services page in Kiswahili. */
export function ServicesView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return (
    <Page lang={lang} className="v2-servicesp">
      <JsonLd data={graph(breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.services, path: paths.services[lang] }]), ...services.map((sv) => serviceLd(sv, lang, svcPath(sv, lang))))} />
      <ServicesBlock lang={lang} />
    </Page>
  );
}

/** The services' search data, for the page that shows them in English (About). */
export function ServicesLd() {
  return <JsonLd data={graph(...services.map((sv) => serviceLd(sv, 'en', svcPath(sv, 'en'))))} />;
}

/** One service, in one language. */
export function ServiceView({ service: s, lang }: { service: Service; lang: Lang }) {
  const t = UI[lang];
  const x = s[lang];
  const work = s.work.map((slug) => findProject(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Page lang={lang}>
      <JsonLd data={graph(serviceLd(s, lang, svcPath(s, lang)), breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.services, path: paths.services[lang] }, { name: x.title, path: svcPath(s, lang) }]))} />
      <PageHero lang={lang} tag={t.services} title={x.title} lead={x.lead} other={svcPath(s, lang === 'sw' ? 'en' : 'sw')}
        crumbs={[{ href: home(lang), label: t.home }, { href: paths.services[lang], label: t.services }, { label: x.title }]} />
      <Section label={t.offer} n={1}>
        <div className="v2-split">
          <ul className="v2-list">{x.offer.map((o, i) => <li key={o} className="v2-rise" style={{ '--d': i } as React.CSSProperties}><span>{pad(i + 1)}</span><span>{o}</span></li>)}</ul>
          <aside className="v2-split__side v2-rise" style={{ '--d': 2 } as React.CSSProperties}>
            <p className="v2-label">{t.forWho}</p>
            <ul className="v2-leaves">{x.forWho.map((o) => <li key={o}>{o}</li>)}</ul>
          </aside>
        </div>
      </Section>
      <Section label={t.steps} n={2}>
        <ol className="v2-steps">
          {x.steps.map((st, i) => (
            <li key={st.title} className="v2-step v2-rise" style={{ '--d': i } as React.CSSProperties}>
              <span className="v2-step__n">{pad(i + 1)}</span>
              <h3 className="v2-step__title">{tc(st.title)}</h3>
              <p>{st.text}</p>
            </li>
          ))}
        </ol>
      </Section>
      {work.length > 0 && (
        <Section label={t.work} n={3}>
          <ul className="v2-cards">
            {work.map(({ project, category }, i) => (
              <LinkCard key={project.slug} d={i} href={`/work/${project.slug}`} img={coverOf(project)} n={category.name} title={project.title} text={project.summary} />
            ))}
          </ul>
        </Section>
      )}
      <Section label={t.more} n={work.length ? 4 : 3}>
        <ul className="v2-cards">
          {services.filter((o) => o.slug !== s.slug).map((o, i) => (
            <LinkCard key={o.slug} d={i} href={svcPath(o, lang)} title={o[lang].title} text={o[lang].short} />
          ))}
        </ul>
      </Section>
    </Page>
  );
}

/** /faq and /sw/maswali. */
export function FaqView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const title = lang === 'sw' ? <>Maswali <em>{tc('yanayoulizwa mara kwa mara', { start: false })}</em></> : <>{tc('Questions people ask')} <em>{tc('before they start', { start: false })}</em></>;
  return (
    <Page lang={lang}>
      <JsonLd data={graph(faqLd(faq[lang], lang), breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.faq, path: paths.faq[lang] }]))} />
      <PageHero lang={lang} tag={t.faq} title={title} other={paths.faq[lang === 'sw' ? 'en' : 'sw']} crumbs={[{ href: home(lang), label: t.home }, { label: t.faq }]} />
      <Section label={t.faq} n={1}><Faq items={faq[lang]} /></Section>
    </Page>
  );
}

/** /journal: the opening, the newest post as a cover, every post in rows with language and topic filters. */
export function JournalView({ posts }: { posts: Post[] }) {
  const cards = posts.map((p) => ({
    slug: p.slug, title: p.title, description: p.description, date: p.date, dateText: dateFmt(p.date, p.lang), lang: p.lang, tags: p.tags,
    minutes: UI[p.lang].minutes(readingTime(p)),
  }));
  return (
    <Page lang="en" className="v2-journal">
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
  const t = UI[p.lang];
  const list = allPosts();
  const at = list.findIndex((x) => x.slug === p.slug);
  const older = list[at + 1] ?? null, newer = at > 0 ? list[at - 1] : null;
  return (
    <Page lang={p.lang} className="v2-postp">
      <JsonLd data={graph(postLd(p), breadcrumbs([{ name: t.home, path: '/' }, { name: t.journal, path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }]))} />
      <ReadingBar />
      <header className="v2-ph v2-dark">
        <svg className="v2-hloop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="v2-hloop__thin" d={THIN} pathLength={1} />
          <path className="v2-hloop__base" d={LOOP} pathLength={1} />
        </svg>
        <div className="v2-ph__in">
          <nav className="v2-ph__crumbs" aria-label={p.lang === 'sw' ? 'Ulipo' : 'Breadcrumb'}>
            <Link href={'/journal'}>← {t.journal}</Link>
            {p.pair && <Link href={`/journal/${p.pair}`} hrefLang={p.lang === 'sw' ? 'en' : 'sw'}>{t.other}</Link>}
          </nav>
          <p className="v2-ph__meta">{dateFmt(p.date, p.lang)} · {t.minutes(readingTime(p))}{p.tags.length > 0 && <> · {p.tags.map((x) => tc(x)).join(', ')}</>}</p>
          <h1 className="v2-ph__title">{tc(p.title)}</h1>
          <p className="v2-ph__dek">{p.description}</p>
          <p className="v2-ph__by">Shivam Parmar, Shivo Labs</p>
        </div>
      </header>
      <article className="v2-pa" aria-label={p.title}>
        <Article html={p.html} toc={p.toc} lang={p.lang} />
        <div className="v2-pa__end">
          <p className="v2-post__end" aria-hidden="true">✳</p>
          {p.pair && (
            <p className="v2-pa__pair">
              {p.lang === 'sw' ? 'Makala hii pia ipo kwa Kiingereza.' : 'This post is also in Kiswahili.'}{' '}
              <Link className="v2-link" href={`/journal/${p.pair}`} hrefLang={p.lang === 'sw' ? 'en' : 'sw'}>{t.other}</Link>
            </p>
          )}
        </div>
      </article>
      <ProjectNav base="/journal" allLabel={t.allPosts} prevLabel={p.lang === 'sw' ? 'Makala mpya zaidi' : 'Newer post'} nextLabel={p.lang === 'sw' ? 'Makala iliyotangulia' : 'Older post'}
        prev={newer && { slug: newer.slug, title: newer.title }} next={older && { slug: older.slug, title: older.title }} />
    </Page>
  );
}
