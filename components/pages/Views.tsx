import Link from 'next/link';
import { areas, services, type Lang, type Service } from '@/lib/services';
import { faq } from '@/lib/faq';
import { coverOf, findProject } from '@/lib/work';
import { breadcrumbs, faqLd, graph, postLd, serviceLd } from '@/lib/schema';
import { readingTime, type Post } from '@/lib/journal';
import { Hero, JsonLd, Page, Section, UI, pad, paths } from './Kit';

const svcPath = (s: Service, lang: Lang) => (lang === 'sw' ? `/sw/huduma/${s.swSlug}` : `/services/${s.slug}`);
const home = (lang: Lang) => (lang === 'sw' ? '/sw/huduma' : '/');
const dateFmt = (d: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

/** /services and /sw/huduma: every service as a card. */
export function ServicesView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const title = lang === 'sw' ? 'Huduma za kidijitali kwa biashara Tanzania na Afrika Mashariki' : 'Digital services for businesses in Tanzania and East Africa';
  const lead = lang === 'sw'
    ? 'Shivo Labs ni kampuni ya suluhisho za kidijitali jijini Dar es Salaam. Tunajenga tovuti na programu, mifumo ya biashara, AI na otomatiki, na chapa zinazovutia.'
    : 'Shivo Labs is a digital solutions company in Dar es Salaam. We build websites and apps, business systems, AI workflows and automation, and brands that stand out.';
  return (
    <Page lang={lang} label={t.services}>
      <JsonLd data={graph(breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.services, path: paths.services[lang] }]),
        ...services.map((s) => serviceLd(s, lang, svcPath(s, lang))))} />
      <Hero lang={lang} tag={t.services} title={title} lead={lead} other={paths.services[lang === 'sw' ? 'en' : 'sw']}
        crumbs={[{ href: lang === 'sw' ? '/' : '/', label: t.home }, { label: t.services }]} />
      <Section label={t.services}>
        <ul className="pg-cards pg-cards--two">
          {services.map((s, i) => (
            <li key={s.slug} className="pg-card">
              <span className="pg-card__n mono">{pad(i + 1)}</span>
              <h2>{s[lang].title}</h2>
              <p>{s[lang].short}</p>
              <Link className="pg-card__go mono" href={svcPath(s, lang)}>{t.read}<span aria-hidden="true">↗</span></Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section label={t.areas}><p className="lead">{areas[lang]}</p></Section>
    </Page>
  );
}

/** One service, in one language. */
export function ServiceView({ service: s, lang }: { service: Service; lang: Lang }) {
  const t = UI[lang];
  const x = s[lang];
  const path = svcPath(s, lang);
  const work = s.work.map((slug) => findProject(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Page lang={lang} label={x.title}>
      <JsonLd data={graph(serviceLd(s, lang, path), breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.services, path: paths.services[lang] }, { name: x.title, path }]))} />
      <Hero lang={lang} tag={t.services} title={x.title} lead={x.lead} other={svcPath(s, lang === 'sw' ? 'en' : 'sw')}
        crumbs={[{ href: '/', label: t.home }, { href: paths.services[lang], label: t.services }, { label: x.title }]} />
      <Section label={t.offer}>
        <ul className="pg-list">{x.offer.map((o, i) => <li key={o}><span>{pad(i + 1)}</span><span>{o}</span></li>)}</ul>
      </Section>
      <Section label={t.forWho}>
        <ul className="pg-list">{x.forWho.map((o, i) => <li key={o}><span>{pad(i + 1)}</span><span>{o}</span></li>)}</ul>
      </Section>
      <Section label={t.steps}>
        <ol className="pg-steps">{x.steps.map((st, i) => <li key={st.title} className="pg-step"><span className="mono">{pad(i + 1)}</span><h3>{st.title}</h3><p>{st.text}</p></li>)}</ol>
      </Section>
      {work.length > 0 && (
        <Section label={t.work}>
          <ul className="pg-cards">
            {work.map(({ project, category }) => (
              <li key={project.slug} className="pg-card">
                {coverOf(project) && <span className="pg-card__img" style={{ backgroundImage: `url(${coverOf(project)})` }} aria-hidden="true" />}
                <span className="pg-card__n mono">{category.name}</span>
                <h3>{project.title}</h3>
                {project.summary && <p>{project.summary}</p>}
                <Link className="pg-card__go mono" href={`/work/${project.slug}`}>{t.seeWork}<span aria-hidden="true">↗</span></Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section label={t.more}>
        <ul className="pg-cards">
          {services.filter((o) => o.slug !== s.slug).map((o) => (
            <li key={o.slug} className="pg-card"><h3>{o[lang].title}</h3><p>{o[lang].short}</p>
              <Link className="pg-card__go mono" href={svcPath(o, lang)}>{t.read}<span aria-hidden="true">↗</span></Link></li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}

/** /faq and /sw/maswali. */
export function FaqView({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const items = faq[lang];
  const title = lang === 'sw' ? 'Maswali yanayoulizwa mara kwa mara' : 'Questions people ask before they start';
  return (
    <Page lang={lang} label={t.faq}>
      <JsonLd data={graph(faqLd(items, lang), breadcrumbs([{ name: t.home, path: home(lang) }, { name: t.faq, path: paths.faq[lang] }]))} />
      <Hero lang={lang} tag={t.faq} title={title} other={paths.faq[lang === 'sw' ? 'en' : 'sw']} crumbs={[{ href: '/', label: t.home }, { label: t.faq }]} />
      <Section label={t.faq}>
        <div className="pg-faq">
          {items.map((x, i) => <details key={x.q} open={i === 0}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </div>
      </Section>
    </Page>
  );
}

/** /journal: every post, newest first, both languages. */
export function JournalView({ posts }: { posts: Post[] }) {
  const t = UI.en;
  return (
    <Page lang="en" label={t.journal}>
      <JsonLd data={graph(breadcrumbs([{ name: t.home, path: '/' }, { name: t.journal, path: '/journal' }]))} />
      <Hero lang="en" tag={t.journal} title="Notes on websites, systems and AI for businesses in Africa"
        lead="Plain guides from Shivo Labs in Dar es Salaam, in English and Kiswahili. Makala kwa Kiingereza na Kiswahili."
        crumbs={[{ href: '/', label: t.home }, { label: t.journal }]} />
      <Section label={t.allPosts}>
        <ul className="pg-cards">
          {posts.map((p) => (
            <li key={p.slug} className="pg-card" lang={p.lang}>
              <span className="pg-card__n mono">{dateFmt(p.date, p.lang)} · {p.lang === 'sw' ? 'Kiswahili' : 'English'}</span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <Link className="pg-card__go mono" href={`/journal/${p.slug}`}>{UI[p.lang].read}<span aria-hidden="true">↗</span></Link>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}

/** One journal post. */
export function PostView({ post: p }: { post: Post }) {
  const t = UI[p.lang];
  return (
    <Page lang={p.lang} label={p.title}>
      <JsonLd data={graph(postLd(p), breadcrumbs([{ name: t.home, path: '/' }, { name: t.journal, path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }]))} />
      <Hero lang={p.lang} tag={t.journal} title={p.title} lead={p.description} other={p.pair ? `/journal/${p.pair}` : undefined}
        crumbs={[{ href: '/', label: t.home }, { href: '/journal', label: t.journal }, { label: dateFmt(p.date, p.lang) }]} />
      <article className="pg-sec" aria-label={p.title}>
        <p className="pg-sec__label mono pg-post__meta"><span>{dateFmt(p.date, p.lang)}</span><span>{t.minutes(readingTime(p))}</span></p>
        <div className="prose pg-post" dangerouslySetInnerHTML={{ __html: p.html }} />
      </article>
      <p className="mono" style={{ paddingTop: '2rem' }}><Link href="/journal">← {t.allPosts}</Link></p>
    </Page>
  );
}
