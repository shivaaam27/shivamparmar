import { site } from './content';
import { categoryHasWork, categories, pagedProjects } from './work';
import { areas, services } from './services';

/**
 * Search-engine basics in one place: the site's public address, every page
 * worth listing, and the "who is this" card search engines read.
 */

/** The public address. Pages are built ahead of time, so this must be right at build time too: SITE_URL, else shivolabs.com in
 *  any production build (next build), else the local preview address. */
export const siteUrl = () =>
  (process.env.SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://shivolabs.com' : 'http://localhost:3210')).replace(/\/$/, '');

/** Every public page, most important first. Insights and the API are never listed. */
export function publicPaths() {
  return [
    { path: '/', priority: 1 },
    { path: '/about', priority: 0.9 },
    { path: '/work', priority: 0.9 },
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.9 })),
    { path: '/sw/huduma', priority: 0.85 },
    ...services.map((s) => ({ path: `/sw/huduma/${s.swSlug}`, priority: 0.8 })),
    { path: '/faq', priority: 0.8 },
    { path: '/sw/maswali', priority: 0.75 },
    { path: '/journal', priority: 0.8 },
    { path: '/contact', priority: 0.8 },
    ...categories.filter(categoryHasWork).map((c) => ({ path: `/work/${c.slug}`, priority: 0.7 })),
    ...pagedProjects().map(({ project }) => ({ path: `/work/${project.slug}`, priority: 0.6 })),
  ];
}

/** Key for IndexNow (Bing, Yandex, Seznam…); the same text is served at /<key>.txt. */
export const INDEXNOW_KEY = '6322fb909f2bf56c2a9f3a5be9cd87c8';

/** Structured data: who this site is about. */
export function personJsonLd() {
  const url = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${url}/#organization`,
        alternateName: 'Shivo Labs Tanzania',
        areaServed: areas.schema.map((name) => ({ '@type': 'Place', name })),
        availableLanguage: ['English', 'Swahili'],
        priceRange: 'Quote on request',
        makesOffer: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.en.title, url: `${url}/services/${s.slug}` } })),
        contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: site.phones[0].tel, email: site.email, availableLanguage: ['English', 'Swahili'], areaServed: 'TZ' },
        name: site.fullName,
        url,
        logo: `${url}/og.png`,
        image: `${url}/og.png`,
        email: `mailto:${site.email}`,
        telephone: site.phones[0].tel,
        description: site.description,
        address: { '@type': 'PostalAddress', addressLocality: 'Dar es Salaam', addressCountry: 'TZ' },
        knowsAbout: ['Websites and apps', 'Custom software', 'AI workflows', 'Automation', 'Branding', 'Social media', 'Digital strategy'],
        founder: { '@id': `${url}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${url}/#person`,
        name: site.founder.name,
        givenName: 'Shivam',
        familyName: 'Parmar',
        url: `${url}/about`,
        image: `${url}/images/hero-dashboard.jpg`,
        email: `mailto:${site.email}`,
        telephone: site.phones[0].tel,
        jobTitle: site.founder.jobTitle,
        worksFor: { '@id': `${url}/#organization` },
        description: 'Founder of Shivo Labs; pharmacist, photographer and systems builder in Dar es Salaam, Tanzania.',
        address: { '@type': 'PostalAddress', addressLocality: 'Dar es Salaam', addressCountry: 'TZ' },
        knowsAbout: ['Pharmacy', 'Pharmacovigilance', 'Photography', 'Graphic design', 'Business systems', 'AI workflows', 'Prompt engineering'],
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'GITAM Deemed to be University' },
          { '@type': 'CollegeOrUniversity', name: 'Muhimbili University of Health and Allied Sciences' },
          { '@type': 'EducationalOrganization', name: 'Kilimanjaro School of Pharmacy' },
        ],
        sameAs: site.sameAs,
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: site.fullName,
        description: site.description,
        publisher: { '@id': `${url}/#organization` },
        inLanguage: 'en',
      },
    ],
  };
}
