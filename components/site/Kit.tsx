import Link from 'next/link';
import { site } from '@/lib/content';
import type { Lang } from '@/lib/services';
import { tc } from '@/lib/title-case';
import { ArrowUR, BigLeaf, Loop, LOOPS } from './Art';
import Ribbons from './Ribbons';

/** The words around the content on the inner pages, in both languages. */
export const UI = {
  en: {
    home: 'Home', services: 'Services', faq: 'Questions', journal: 'Journal', products: 'Products', work: 'Work', about: 'About',
    offer: 'What you get', forWho: 'Who it is for', steps: 'How it works', areas: 'Where we work',
    more: 'More services', read: 'Read', minutes: (n: number) => `${n} min read`, other: 'Kiswahili',
    ctaTitle: 'Tell us what you need', ctaText: 'The first conversation is free.', whatsapp: 'WhatsApp', email: 'Email',
    allPosts: 'All posts', seeWork: 'See the project', also: 'Also in Kiswahili',
  },
  sw: {
    home: 'Mwanzo', services: 'Huduma', faq: 'Maswali', journal: 'Makala', products: 'Bidhaa', work: 'Kazi zetu', about: 'Kuhusu',
    offer: 'Unachopata', forWho: 'Ni kwa ajili ya nani', steps: 'Jinsi inavyofanya kazi', areas: 'Tunapofanya kazi',
    more: 'Huduma nyingine', read: 'Soma', minutes: (n: number) => `Dakika ${n} kusoma`, other: 'English',
    ctaTitle: 'Tuambie unachohitaji', ctaText: 'Mazungumzo ya kwanza ni bure.', whatsapp: 'WhatsApp', email: 'Barua pepe',
    allPosts: 'Makala zote', seeWork: 'Angalia mradi', also: 'Pia kwa Kiingereza',
  },
} as const;

export const paths = {
  services: { en: '/about#services', sw: '/sw/huduma' },
  faq: { en: '/faq', sw: '/sw/maswali' },
};

export const pad = (n: number) => String(n).padStart(2, '0');

/** The page frame: the page itself, then the closing "tell us" card. Header and footer come from the site layout. */
/** A page's description for search engines and AI assistants (schema.org, lib/schema.ts). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function Page({ lang = 'en', children, className = '', cta = true }: { lang?: Lang; children: React.ReactNode; className?: string; cta?: boolean }) {
  return (
    <main id="main" className={`v2-page ${className}`} lang={lang}>
      {children}
      {cta && <Cta lang={lang} />}
    </main>
  );
}

/**
 * The top of an inner page: deep green (or lime) with rounded lower corners and the moving lines in its corner;
 * the trail of pages, the section's name, the title and the lead.
 */
export function PageHero({ tag, title, lead, crumbs, lang = 'en', other, tone = 'forest', children }: {
  tag: string; title: React.ReactNode; lead?: string; lang?: Lang; tone?: 'forest' | 'lime';
  crumbs: { href?: string; label: string }[]; other?: string; children?: React.ReactNode;
}) {
  const light = tone === 'lime';
  return (
    <section className={`v2-phero v2-phero--${tone}${light ? '' : ' v2-dark'}`} data-reveal>
      <Ribbons set={light ? 'hero' : 'page'} className="v2-phero__lines" />
      <div className="v2-wrap v2-phero__in">
        <nav className="v2-crumbs v2-rise" aria-label={lang === 'sw' ? 'Ulipo' : 'Breadcrumb'}>
          {crumbs.map((c, i) => (c.href
            ? <Link key={i} href={c.href}>{tc(c.label)}</Link>
            : <span key={i} aria-current="page">{tc(c.label)}</span>))}
        </nav>
        <h1 className="v2-h1 v2-phero__title v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{typeof title === 'string' ? tc(title) : title}</h1>
        {lead && <p className="v2-lead v2-phero__lead v2-rise" style={{ '--d': 2 } as React.CSSProperties}>{lead}</p>}
        {(other || children) && (
          <div className="v2-phero__extra v2-rise" style={{ '--d': 3 } as React.CSSProperties}>
            {children}
            {other && <Link className="v2-phero__lang" href={other} hrefLang={lang === 'sw' ? 'en' : 'sw'}>{UI[lang].other} <ArrowUR /></Link>}
          </div>
        )}
      </div>
    </section>
  );
}

/** A section of an inner page: the magazine label with its rule, then the content. */
export function Section({ label, children, id, n }: { label: string; children: React.ReactNode; id?: string; n?: number; wide?: boolean }) {
  return (
    <section className="v2-psec" aria-label={label} id={id} data-reveal>
      <div className="v2-wrap">
        <h2 className="v2-psec__title v2-rise">{tc(label)}</h2>
        <div className="v2-psec__body">{children}</div>
      </div>
    </section>
  );
}

/** The closing card on every inner page: tell us what you need, WhatsApp or email (the contact card's look). */
export function Cta({ lang = 'en' }: { lang?: Lang }) {
  const t = UI[lang];
  const [phone] = site.phones;
  return (
    <section className="v2-sec v2-pcta" aria-label={t.ctaTitle}>
      <div className="v2-wrap">
        <div className="v2-card v2-card--lime v2-pcta__card" data-reveal>
          <Loop className="v2-pcta__loop" d={LOOPS.spring} viewBox="0 0 560 160" color="var(--forest)" width={9} />
          <BigLeaf className="v2-pcta__leaf v2-sway v2-sway--slow" />
          <h2 className="v2-h2 v2-rise">{tc(t.ctaTitle)}</h2>
          <p className="v2-pcta__text v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{t.ctaText}</p>
          <div className="v2-pcta__row v2-rise" style={{ '--d': 2 } as React.CSSProperties}>
            <a className="v2-btn" href={`https://wa.me/${phone.wa}`} target="_blank" rel="noopener" data-umami-event={`Contact · WhatsApp (${lang})`}>
              {t.whatsapp} {phone.label}<span className="v2-btn__dot"><ArrowUR /></span>
            </a>
            <a className="v2-btn" href={`mailto:${site.email}`} data-umami-event={`Contact · Email (${lang})`}>
              {t.email} {site.email}<span className="v2-btn__dot"><ArrowUR /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A card that links somewhere: a small label, a title, a line of text, an arrow; optionally a picture on top. */
export function LinkCard({ href, n, title, text, img, tone = 'white', as: H = 'h3', lang, d = 0 }: {
  href: string; n?: string; title: string; text?: string; img?: string; tone?: string; as?: 'h2' | 'h3'; lang?: string; d?: number;
}) {
  return (
    <li className="v2-lcard-li v2-rise" lang={lang} style={{ '--d': d } as React.CSSProperties}>
      <Link className={`v2-card v2-card--${tone} v2-lcard`} href={href}>
        {img && <span className="v2-lcard__img"><img src={img} alt="" loading="lazy" /></span>}
        {n && <span className="v2-lcard__n">{n}</span>}
        <H className="v2-lcard__title">{tc(title)}</H>
        {text && <span className="v2-lcard__text">{text}</span>}
        <span className="v2-lcard__go" aria-hidden="true"><ArrowUR /></span>
      </Link>
    </li>
  );
}

/** Home for a language: the home page for English, the Kiswahili services page for Kiswahili. */
export const home = (lang: Lang) => (lang === 'sw' ? '/sw/huduma' : '/');
