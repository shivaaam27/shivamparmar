import Link from 'next/link';
import { areas, services, type Lang, type Service } from '@/lib/services';
import { faq } from '@/lib/faq';
import { coverOf, findProject } from '@/lib/work';
import { readingTime, type Post } from '@/lib/journal';
import { tc, v2 } from '@/lib/v2';
import { LinkCard, Page, PageHero, Section, UI, home, pad, paths } from './Kit';
import Faq from './Faq';
import ReadingBar from './ReadingBar';
import { ArrowUR } from './Art';

const svcPath = (s: Service, lang: Lang) => v2(lang === 'sw' ? `/sw/huduma/${s.swSlug}` : `/services/${s.slug}`);
const dateFmt = (d: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

/** /v2/services and /v2/sw/huduma: every service as a card. */
export function ServicesView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const title = lang === 'sw'
    ? <>{tc('Huduma za kidijitali')} <em>{tc('kwa biashara Tanzania na Afrika Mashariki', { start: false })}</em></>
    : <>{tc('Digital services')} <em>{tc('for businesses in Tanzania and East Africa', { start: false })}</em></>;
  const lead = lang === 'sw'
    ? 'Shivo Labs ni kampuni ya suluhisho za kidijitali jijini Dar es Salaam. Tunajenga tovuti na programu, mifumo ya biashara, AI na otomatiki, na chapa zinazovutia.'
    : 'Shivo Labs is a digital solutions company in Dar es Salaam. We build websites and apps, business systems, AI workflows and automation, and brands that stand out.';
  return (
    <Page lang={lang}>
      <PageHero lang={lang} tag={t.services} title={title} lead={lead} other={v2(paths.services[lang === 'sw' ? 'en' : 'sw'])}
        crumbs={[{ href: home(lang), label: t.home }, { label: t.services }]} />
      <Section label={t.services} n={1}>
        <ul className="v2-cards v2-cards--two">
          {services.map((s, i) => (
            <LinkCard key={s.slug} d={i} href={svcPath(s, lang)} n={pad(i + 1)} title={s[lang].title} text={s[lang].short} tone={i === 0 ? 'lime' : 'white'} as="h2" />
          ))}
        </ul>
      </Section>
      <Section label={t.areas} n={2}><p className="v2-lead v2-psec__lead v2-rise">{areas[lang]}</p></Section>
    </Page>
  );
}

/** One service, in one language. */
export function ServiceView({ service: s, lang }: { service: Service; lang: Lang }) {
  const t = UI[lang];
  const x = s[lang];
  const work = s.work.map((slug) => findProject(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Page lang={lang}>
      <PageHero lang={lang} tag={t.services} title={x.title} lead={x.lead} other={svcPath(s, lang === 'sw' ? 'en' : 'sw')}
        crumbs={[{ href: home(lang), label: t.home }, { href: v2(paths.services[lang]), label: t.services }, { label: x.title }]} />
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
              <LinkCard key={project.slug} d={i} href={v2(`/work/${project.slug}`)} img={coverOf(project)} n={category.name} title={project.title} text={project.summary} />
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

/** /v2/faq and /v2/sw/maswali. */
export function FaqView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const title = lang === 'sw' ? <>Maswali <em>{tc('yanayoulizwa mara kwa mara', { start: false })}</em></> : <>{tc('Questions people ask')} <em>{tc('before they start', { start: false })}</em></>;
  return (
    <Page lang={lang}>
      <PageHero lang={lang} tag={t.faq} title={title} other={v2(paths.faq[lang === 'sw' ? 'en' : 'sw'])} crumbs={[{ href: home(lang), label: t.home }, { label: t.faq }]} />
      <Section label={t.faq} n={1}><Faq items={faq[lang]} /></Section>
    </Page>
  );
}

/** /v2/journal: the newest post as the cover story, then every other post as a row in the contents. */
export function JournalView({ posts }: { posts: Post[] }) {
  const t = UI.en;
  const [lead, ...rest] = posts;
  return (
    <Page lang="en" className="v2-journal">
      <PageHero tag={t.journal} title={<>{tc('Notes on websites, systems and AI')} <em>{tc('for businesses in Africa', { start: false })}</em></>}
        lead="Plain guides from Shivo Labs in Dar es Salaam, in English and Kiswahili. Makala kwa Kiingereza na Kiswahili."
        crumbs={[{ href: v2('/'), label: t.home }, { label: t.journal }]} />
      {lead && (
        <section className="v2-sec v2-sec--tight v2-jcover" aria-label="Latest" data-reveal>
          <div className="v2-wrap">
            <Link href={v2(`/journal/${lead.slug}`)} className="v2-jcover__card v2-rise" lang={lead.lang}>
              <span className="v2-jcover__meta"><span className="v2-jcover__new">Latest</span>{dateFmt(lead.date, lead.lang)} · {lead.lang === 'sw' ? 'Kiswahili' : 'English'} · {UI[lead.lang].minutes(readingTime(lead))}</span>
              <h2 className="v2-jcover__title">{tc(lead.title)}</h2>
              <p className="v2-jcover__text">{lead.description}</p>
              <span className="v2-more">{UI[lead.lang].read} <ArrowUR /></span>
            </Link>
          </div>
        </section>
      )}
      {rest.length > 0 && (
        <Section label={t.allPosts} n={1}>
          <ol className="v2-jlist">
            {rest.map((p, i) => (
              <li key={p.slug} className="v2-rise" style={{ '--d': i } as React.CSSProperties} lang={p.lang}>
                <Link href={v2(`/journal/${p.slug}`)} className="v2-jlist__row">
                  <span className="v2-jlist__date">{dateFmt(p.date, p.lang)}</span>
                  <span className="v2-jlist__body"><b>{tc(p.title)}</b><span>{p.description}</span></span>
                  <span className="v2-jlist__meta">{p.lang === 'sw' ? 'Kiswahili' : 'English'} · {UI[p.lang].minutes(readingTime(p))}</span>
                  <span className="v2-jlist__go" aria-hidden="true"><ArrowUR /></span>
                </Link>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </Page>
  );
}

/** One journal post: a calm reading page with a progress line along the top. */
export function PostView({ post: p }: { post: Post }) {
  const t = UI[p.lang];
  return (
    <Page lang={p.lang} className="v2-postp">
      <ReadingBar />
      <header className="v2-post__head">
        <div className="v2-wrap v2-post__head-in">
          <nav className="v2-crumbs" aria-label={p.lang === 'sw' ? 'Ulipo' : 'Breadcrumb'}>
            <Link href={v2('/')}>{t.home}</Link><Link href={v2('/journal')}>{t.journal}</Link>
          </nav>
          <p className="v2-post__meta">{dateFmt(p.date, p.lang)} · {t.minutes(readingTime(p))}{p.tags.length > 0 && <> · {p.tags.join(', ')}</>}</p>
          <h1 className="v2-post__title">{tc(p.title)}</h1>
          <p className="v2-post__dek">{p.description}</p>
          <p className="v2-post__by">Shivam Parmar, Shivo Labs{p.pair && <> · <Link className="v2-link" href={v2(`/journal/${p.pair}`)} hrefLang={p.lang === 'sw' ? 'en' : 'sw'}>{t.other}</Link></>}</p>
        </div>
      </header>
      <article className="v2-post" aria-label={p.title}>
        <div className="v2-wrap">
          <div className="v2-prose" dangerouslySetInnerHTML={{ __html: p.html }} />
          <p className="v2-post__end" aria-hidden="true">✳</p>
          <p className="v2-post__back"><Link className="v2-more" href={v2('/journal')}>{t.allPosts} <ArrowUR /></Link></p>
        </div>
      </article>
    </Page>
  );
}
