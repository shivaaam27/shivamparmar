import { site } from './content';
import { categoryHasWork, categories, pagedProjects } from './work';

/**
 * Search-engine basics in one place: the site's public address, every page
 * worth listing, and the "who is this" card search engines read.
 */

/** The public address: a custom domain later (SITE_URL), else Vercel's production host. */
export const siteUrl = () =>
  (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')).replace(/\/$/, '');

/** Every public page, most important first. Insights and the API are never listed. */
export function publicPaths() {
  return [
    { path: '/', priority: 1 },
    { path: '/about', priority: 0.9 },
    { path: '/work', priority: 0.9 },
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
        '@type': 'Person',
        '@id': `${url}/#person`,
        name: site.fullName,
        givenName: 'Shivam',
        familyName: 'Parmar',
        url,
        image: `${url}/images/hero-dashboard.jpg`,
        email: `mailto:${site.email}`,
        telephone: site.phones[0].tel,
        jobTitle: site.jobTitle,
        description: site.description,
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
        publisher: { '@id': `${url}/#person` },
        inLanguage: 'en',
      },
    ],
  };
}
