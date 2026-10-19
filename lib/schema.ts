import { site } from './content';
import { siteUrl } from './seo';
import { areas, type Lang, type Service } from './services';
import type { Qa } from './faq';

/**
 * schema.org descriptions for the services, FAQ and journal pages. Search engines and AI assistants read these to
 * know exactly what a page is: a service Shivo Labs offers, its answers to common questions, or an article.
 */

const org = () => ({ '@id': `${siteUrl()}/#organization` });
const inLanguage = (lang: Lang) => (lang === 'sw' ? 'sw-TZ' : 'en');

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${siteUrl()}${it.path}` })),
  };
}

export function serviceLd(s: Service, lang: Lang, path: string) {
  const t = s[lang];
  return {
    '@type': 'Service',
    '@id': `${siteUrl()}${path}#service`,
    name: t.title,
    description: t.lead,
    serviceType: s.en.title,
    provider: org(),
    areaServed: areas.schema.map((name) => ({ '@type': 'Place', name })),
    availableLanguage: ['en', 'sw'],
    url: `${siteUrl()}${path}`,
    inLanguage: inLanguage(lang),
    hasOfferCatalog: { '@type': 'OfferCatalog', name: t.offer.length ? t.title : '', itemListElement: t.offer.map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o } })) },
  };
}

export function faqLd(items: Qa[], lang: Lang) {
  return {
    '@type': 'FAQPage',
    inLanguage: inLanguage(lang),
    mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  };
}

export function postLd(p: { slug: string; title: string; description: string; date: string; lang: Lang; tags: string[]; words: number }) {
  return {
    '@type': 'BlogPosting',
    '@id': `${siteUrl()}/journal/${p.slug}#post`,
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    inLanguage: inLanguage(p.lang),
    keywords: p.tags.join(', '),
    wordCount: p.words,
    author: { '@type': 'Person', '@id': `${siteUrl()}/#person`, name: site.founder.name },
    publisher: org(),
    mainEntityOfPage: `${siteUrl()}/journal/${p.slug}`,
    image: `${siteUrl()}/og.png`,
  };
}

export const graph = (...items: unknown[]) => ({ '@context': 'https://schema.org', '@graph': items });
