import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import Tag from '@/components/Tag';
import { site } from '@/lib/content';
import type { Lang } from '@/lib/services';

/** The words the new pages use around the content, in both languages. */
export const UI = {
  en: {
    home: 'Home', services: 'Services', faq: 'Questions', journal: 'Journal',
    offer: 'What you get', forWho: 'Who it is for', steps: 'How it works', work: 'Work', areas: 'Where we work',
    more: 'More services', read: 'Read', minutes: (n: number) => `${n} min read`, other: 'Kiswahili',
    ctaTitle: 'Tell us what you need', ctaText: 'The first conversation is free.', whatsapp: 'WhatsApp', email: 'Email',
    allPosts: 'All posts', seeWork: 'See the project', also: 'Also in Kiswahili',
  },
  sw: {
    home: 'Mwanzo', services: 'Huduma', faq: 'Maswali', journal: 'Makala',
    offer: 'Unachopata', forWho: 'Ni kwa ajili ya nani', steps: 'Jinsi inavyofanya kazi', work: 'Kazi zetu', areas: 'Tunapofanya kazi',
    more: 'Huduma nyingine', read: 'Soma', minutes: (n: number) => `Dakika ${n} kusoma`, other: 'English',
    ctaTitle: 'Tuambie unachohitaji', ctaText: 'Mazungumzo ya kwanza ni bure.', whatsapp: 'WhatsApp', email: 'Barua pepe',
    allPosts: 'Makala zote', seeWork: 'Angalia mradi', also: 'Pia kwa Kiingereza',
  },
} as const;

export const paths = {
  services: { en: '/services', sw: '/sw/huduma' },
  faq: { en: '/faq', sw: '/sw/maswali' },
  journal: { en: '/journal', sw: '/journal' },
};

/** schema.org data for search engines and AI assistants, as a script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/** The page frame: header, a main in the right language, the closing call to action, footer. */
export function Page({ lang, children, label }: { lang: Lang; children: React.ReactNode; label: string }) {
  return (
    <>
      <Header />
      <Effects />
      <main id="main" className="page pg" lang={lang}>
        <div className="section" style={{ paddingBlock: 0 }} aria-label={label}>{children}<Cta lang={lang} /></div>
      </main>
      <Footer />
    </>
  );
}

export function Hero({ tag, title, lead, crumbs, lang, other }: {
  tag: string; title: string; lead?: string; lang: Lang;
  crumbs: { href?: string; label: string }[]; other?: string;
}) {
  return (
    <section className="pg-hero">
      <nav className="pg-crumbs mono" aria-label={lang === 'sw' ? 'Ulipo' : 'Breadcrumb'}>
        {crumbs.map((c, i) => (c.href ? <Link key={i} href={c.href}>{c.label}</Link> : <span key={i} aria-current="page">{c.label}</span>))}
      </nav>
      <h1 className="pg-hero__title"><Tag>{tag}</Tag>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {other && <p className="pg-lang mono"><Link href={other} hrefLang={lang === 'sw' ? 'en' : 'sw'}>{UI[lang].other}</Link></p>}
    </section>
  );
}

export function Cta({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const [phone] = site.phones;
  return (
    <section className="pg-cta" aria-label={t.ctaTitle}>
      <h2>{t.ctaTitle}</h2>
      <div className="pg-cta__links">
        <p className="lead">{t.ctaText}</p>
        <a className="pg-btn" href={`https://wa.me/${phone.wa}`} target="_blank" rel="noopener" data-umami-event={`Contact · WhatsApp (${lang})`}>{t.whatsapp} {phone.label}<ArrowUpRight size={16} aria-hidden="true" /></a>
        <a className="pg-btn pg-btn--line" href={`mailto:${site.email}`} data-umami-event={`Contact · Email (${lang})`}>{t.email} {site.email}</a>
      </div>
    </section>
  );
}

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="pg-sec" aria-label={label}>
      <h2 className="pg-sec__label mono">{label}</h2>
      <div className="pg-sec__body">{children}</div>
    </section>
  );
}

export const pad = (n: number) => String(n).padStart(2, '0');
