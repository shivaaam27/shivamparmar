import type { Tone } from './content';

/**
 * All work on the site: Category → Sub-category → Project → Images.
 *
 * To add work, add a project to a sub-category. A project with `images`
 * gets its own page at /work/<slug>; one without is shown as "Coming soon".
 * Rename or add sub-categories freely — filters, counts and links follow.
 */

export type WorkImage = { src: string; alt: string; caption?: string };

export type Project = {
  slug: string;
  title: string;
  tone: Tone;            // tonal stand-in until there's a cover image
  cover?: string;        // the strip image; defaults to the first image
  year?: string;
  role?: string;
  tools?: string[];
  summary?: string;
  images?: WorkImage[];
};

export type Subcategory = { slug: string; name: string; projects: Project[] };
export type Category = { slug: string; name: string; subcategories: Subcategory[] };

const soon = (slug: string, tone: Tone): Project => ({ slug, title: 'Coming soon', tone });

export const categories: Category[] = [
  {
    slug: 'systems',
    name: 'Systems',
    subcategories: [
      {
        slug: 'dashboards',
        name: 'Dashboards',
        projects: [
          {
            slug: 'task-management',
            title: 'Task Management',
            tone: 'ink',
            summary: 'Built in-house, and the first in Tanzania: an advanced task management system for a group of companies. One place for every task, across every company.',
            images: [
              { src: '/images/work-signin.jpg', alt: 'Two people at a monitor showing the Task Management sign-in screen', caption: 'Sign in' },
              { src: '/images/work-dashboard.jpg', alt: 'Someone at a laptop surrounded by floating panels of the Task Management dashboard', caption: 'Dashboard' },
              { src: '/images/work-dashboard-ipad.jpg', alt: 'A hand with a stylus over an iPad showing the Task Management dashboard', caption: 'Dashboard on iPad' },
            ],
          },
          {
            slug: 'files-management',
            title: 'Files Management',
            tone: 'stone',
            summary: 'Every company file in one place, filed by hand and found in a second, with permits and certificates flagged before they need renewing.',
            images: [
              { src: '/images/work-files.jpg', alt: 'Two people at a monitor showing the Files Management app', caption: 'All files' },
            ],
          },
        ],
      },
      { slug: 'websites', name: 'Websites', projects: [soon('websites-soon', 'taupe')] },
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    subcategories: [
      { slug: 'portraits', name: 'Portraits', projects: [soon('portraits-soon', 'amber')] },
      { slug: 'street', name: 'Street', projects: [soon('street-soon', 'sand')] },
      { slug: 'events', name: 'Events', projects: [soon('events-soon', 'cyan')] },
    ],
  },
  {
    slug: 'design',
    name: 'Design',
    subcategories: [
      { slug: 'posters', name: 'Posters', projects: [soon('posters-soon', 'oxblood')] },
      { slug: 'social', name: 'Social', projects: [soon('social-soon', 'rose')] },
    ],
  },
  {
    slug: 'pharmacy',
    name: 'Pharmacy',
    subcategories: [
      { slug: 'patient-care', name: 'Patient care', projects: [soon('patient-care-soon', 'sage')] },
      { slug: 'research', name: 'Research', projects: [soon('research-soon', 'olive')] },
    ],
  },
];

/* ---------- helpers ---------- */

export const hasPage = (p: Project) => Boolean(p.images?.length);
export const coverOf = (p: Project) => p.cover ?? p.images?.[0]?.src;

export const countCategory = (c: Category) => c.subcategories.reduce((n, s) => n + s.projects.length, 0);
export const countAll = () => categories.reduce((n, c) => n + countCategory(c), 0);

/** Every project that has a page, in site order, with where it sits. */
export const pagedProjects = () =>
  categories.flatMap((category) =>
    category.subcategories.flatMap((sub) =>
      sub.projects.filter(hasPage).map((project) => ({ category, sub, project })),
    ),
  );

export const findProject = (slug: string) => pagedProjects().find((e) => e.project.slug === slug);
