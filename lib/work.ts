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
      {
        slug: 'dar-es-salaam',
        name: 'Dar es Salaam',
        projects: [
          {
            slug: 'dar-es-salaam',
            title: 'Dar es Salaam',
            tone: 'cyan',
            cover: '/images/dar-bridge.jpg',
            summary: 'Dar es Salaam from the air and at the water’s edge: the new bridge over the bay, a beach at golden hour, a kayak on still water.',
            images: [
              { src: '/images/dar-bridge.jpg', alt: 'Aerial view of the cable-stayed bridge running across the bay towards the Masaki peninsula', caption: 'The bridge' },
              { src: '/images/dar-beach.jpg', alt: 'Looking straight down on a beach at golden hour: palms, two people on loungers, long shadows, rocks and surf', caption: 'Golden hour' },
              { src: '/images/dar-kayak.jpg', alt: 'A blue kayak on dark still water under overhanging green leaves', caption: 'Still water' },
            ],
          },
        ],
      },
      {
        slug: 'morogoro-hotel',
        name: 'Morogoro Hotel',
        projects: [
          {
            slug: 'morogoro-hotel',
            title: 'Morogoro Hotel',
            tone: 'amber',
            cover: '/images/morogoro-aerial.jpg',
            summary: 'Morogoro Hotel, under the Uluguru Mountains: round red roofs from above, and the white walls and clipped hedges between them.',
            images: [
              { src: '/images/morogoro-aerial.jpg', alt: 'Straight down from above: round buildings with red tiled roofs like flowers, among trees and curving hedges', caption: 'From above' },
              { src: '/images/morogoro-roofs.jpg', alt: 'Red tiled roofs and white angled walls in a garden, a tall tree and cloudy mountains behind', caption: 'Under the mountains' },
              { src: '/images/morogoro-garden.jpg', alt: 'A stone path winding through sunlit hedges past white walls and red roofs, palms and tall trees above', caption: 'The garden path' },
            ],
          },
        ],
      },
      {
        slug: 'moshi',
        name: 'Moshi',
        projects: [
          {
            slug: 'moshi',
            title: 'Moshi',
            tone: 'olive',
            cover: '/images/moshi-town.jpg',
            summary: 'Moshi, Tanzania, from the air: the town and its airstrip in morning haze, and the patchwork of fields meeting the forest on the slopes above.',
            images: [
              { src: '/images/moshi-town.jpg', alt: 'Aerial view over Moshi town in morning haze, rooftops and streets leading to a dry airstrip', caption: 'The town' },
              { src: '/images/moshi-fields.jpg', alt: 'Aerial view of patchwork farm fields and red dirt paths on a hillside, a dense pine forest in front', caption: 'Fields and forest' },
            ],
          },
        ],
      },
      {
        slug: 'roros',
        name: 'Roro’s',
        projects: [
          {
            slug: 'roros',
            title: 'Roro’s',
            tone: 'sand',
            cover: '/images/roros-beach.jpg',
            summary: 'Roro’s Beach Bar, Dar es Salaam: sofas on the sand, a bar built from an old boat, live saxophone, and the bay going blue at dusk.',
            images: [
              { src: '/images/roros-beach.jpg', alt: 'Wooden sofas with grey cushions on white sand under a tree, people talking, the sea behind', caption: 'On the sand' },
              { src: '/images/roros-boat-bar.jpg', alt: 'A bar made from an old wooden boat, stools in front, the bay and city skyline behind', caption: 'The boat bar' },
              { src: '/images/roros-sax.jpg', alt: 'A saxophonist in a cap playing beside a wooden DJ booth against an orange timber wall', caption: 'Live sax' },
              { src: '/images/roros-dusk.jpg', alt: 'A waiter in a Roro’s shirt looking out over the sea under a wide blue dusk sky', caption: 'Dusk' },
            ],
          },
        ],
      },
      {
        slug: 'sgr-train',
        name: 'SGR Train',
        projects: [
          {
            slug: 'sgr-train',
            title: 'SGR Train',
            tone: 'oxblood',
            cover: '/images/sgr-platform.jpg',
            summary: 'Tanzania’s SGR electric train: the orange and white carriages at the platform, the long empty aisle, and the view out of the door.',
            images: [
              { src: '/images/sgr-platform.jpg', alt: 'The side of an orange and white SGR train at a platform, reflections in its windows, city towers behind', caption: 'At the platform' },
              { src: '/images/sgr-carriage.jpg', alt: 'Looking down the aisle of an empty SGR carriage, rows of patterned brown seats under warm ceiling light', caption: 'The carriage' },
              { src: '/images/sgr-door.jpg', alt: 'An orange door inside the train, a window onto the rail yard outside', caption: 'The door' },
            ],
          },
        ],
      },
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
