import type { Tone } from './content';

/**
 * All work on the site: Category → Sub-category → Project → Images.
 *
 * To add work, add a project to a sub-category. A project with `images`
 * gets its own page at /work/<slug>; one without is shown as "Coming soon".
 * Rename or add sub-categories freely — filters, counts and links follow.
 * Photography: each shoot (CocoZuri, Dar es Salaam…) is its own sub-category
 * of Photography, holding one project with that shoot's pictures.
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
      {
        slug: 'cocozuri',
        name: 'CocoZuri',
        projects: [
          {
            slug: 'cocozuri',
            title: 'CocoZuri',
            tone: 'oxblood',
            cover: '/images/cocozuri-cookies.jpg',
            summary: 'Product photography for CocoZuri Chocolat, chocolate made in Tanzania: pralines, cookies and the hazelnuts that go into them.',
            images: [
              { src: '/images/cocozuri-pralines.jpg', alt: 'A gold tray of twelve CocoZuri pralines on white marble, seen from above', caption: 'Praline box' },
              { src: '/images/cocozuri-cookies.jpg', alt: 'Chocolate cookies in a CocoZuri box balanced on the edge of a glass shelf', caption: 'Cookies' },
              { src: '/images/cocozuri-cookie-break.jpg', alt: 'Two hands breaking a chocolate cookie in half against a white background', caption: 'The break' },
              { src: '/images/cocozuri-hazelnuts.jpg', alt: 'Chocolate-coated hazelnuts tumbling inside a coating pan', caption: 'Hazelnuts in the pan' },
            ],
          },
        ],
      },
      {
        slug: 'delta-hotel',
        name: 'Delta Hotel',
        projects: [
          {
            slug: 'delta-hotel',
            title: 'Delta Hotel',
            tone: 'stone',
            cover: '/images/delta-facade.jpg',
            summary: 'Delta Hotels by Marriott, Dar es Salaam: the pool, the terrace over the bay, the building and the quiet water in front of it.',
            images: [
              { src: '/images/delta-facade.jpg', alt: 'The Delta Hotels Marriott building in Dar es Salaam, rows of curved balconies seen through leaves', caption: 'The building' },
              { src: '/images/delta-pool.jpg', alt: 'A folded Delta Hotels umbrella over wooden loungers, the round pool and palms behind', caption: 'By the pool' },
              { src: '/images/delta-terrace.jpg', alt: 'A terrace with tables above the bay, framed by palm fronds', caption: 'The terrace' },
              { src: '/images/delta-terrace-bay.jpg', alt: 'The long terrace and its lamp posts above the bay, the city skyline across the water, palms on both sides', caption: 'Across the bay' },
              { src: '/images/delta-canoe.jpg', alt: 'A lone paddler in a wooden canoe on calm grey-blue water under a wide sky', caption: 'The bay' },
              { src: '/images/delta-door.jpg', alt: 'The Delta D frosted on a glass door, a wooden carving on the wall behind', caption: 'The D' },
            ],
          },
        ],
      },
      {
        slug: 'mikumi',
        name: 'Mikumi National Park',
        projects: [
          {
            slug: 'mikumi-national-park',
            title: 'Mikumi National Park',
            tone: 'sage',
            cover: '/images/mikumi-elephants.jpg',
            summary: 'A day in Mikumi National Park, Tanzania: open grassland, big skies and the animals that live under them.',
            images: [
              { src: '/images/mikumi-elephants.jpg', alt: 'Two young elephants facing each other in tall green grass, acacia trees and heavy clouds behind', caption: 'Elephants' },
              { src: '/images/mikumi-giraffe.jpg', alt: 'A giraffe’s head and neck against a grey, cloudy sky', caption: 'Giraffe' },
            ],
          },
        ],
      },
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
