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

/** A picture, or a video: then `src` is its poster (the still shown before it plays). */
export type WorkImage = { src: string; alt: string; caption?: string; video?: string };

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

/** listed: show it on the work page as "Soon" even before it has work. */
export type Subcategory = { slug: string; name: string; projects: Project[]; listed?: boolean };
export type Category = { slug: string; name: string; subcategories: Subcategory[] };

const soon = (slug: string, tone: Tone): Project => ({ slug, title: 'Coming soon', tone });

/** Dar Distributors' unbranded posts, in posting order: a photo, or a video with its cover. */
const DD = '/images/dar-distributors';
const ddPhoto = (slug: string, title: string): WorkImage =>
  ({ src: `${DD}/${slug}.jpg`, alt: `${title}: product photograph for Dar Distributors’ social media`, caption: title });
const ddVideo = (slug: string, title: string): WorkImage =>
  ({ src: `${DD}/${slug}-poster.jpg`, video: `${DD}/${slug}.mp4`, alt: `${title}: short product video for Dar Distributors’ social media`, caption: title });

/** CocoZuri's chocolate photographs, ordered so no two look-alike pictures sit near each other. */
const CZ = '/images/cocozuri-social';
const czPhoto = (slug: string, title: string): WorkImage =>
  ({ src: `${CZ}/${slug}.jpg`, alt: `${title}: chocolate photograph for CocoZuri’s social media`, caption: title });

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
    slug: 'social-media-marketing',
    name: 'Social media marketing',
    subcategories: [
      {
        slug: 'dar-distributors',
        name: 'Dar Distributors',
        projects: [
          {
            slug: 'dar-distributors',
            title: 'Dar Distributors',
            tone: 'olive',
            cover: `${DD}/sliced-black-olives.jpg`,
            summary: 'Social media for Dar Distributors, wholesale food suppliers in Dar es Salaam: product photographs and short videos for the Virginia Green Garden, Golden Royal and Royal Arm ranges, posted in English and Kiswahili.',
            images: [
              ddPhoto('sliced-black-olives', 'Sliced Black Olives'),
              ddVideo('whole-green-olives', 'Whole Green Olives'),
              ddPhoto('sliced-green-olives', 'Sliced Green Olives'),
              ddVideo('golden-royal-fruit-cocktail', 'Golden Royal Fruit Cocktail'),
              ddPhoto('creamy-mayonnaise', 'Creamy Mayonnaise'),
              ddPhoto('ranch-dressing', 'Ranch Dressing'),
              ddVideo('italian-dressing', 'Italian Dressing'),
              ddVideo('kachi-ghani-mustard-oil', 'Kachi Ghani Mustard Oil'),
              ddPhoto('thousand-island-dressing', 'Thousand Island Dressing'),
              ddPhoto('yellow-mustard', 'Yellow Mustard'),
              ddPhoto('french-dressing', 'French Dressing'),
              ddPhoto('pizza-sauce', 'Pizza Sauce'),
              ddVideo('classic-mayonnaise-jar', 'Classic Mayonnaise'),
              ddVideo('custard-powder', 'Custard Powder'),
              ddVideo('dates-syrup', 'Dates Syrup'),
              ddPhoto('whole-peeled-tomatoes', 'Whole Peeled Tomatoes'),
              ddVideo('australian-pure-honey', 'Australian Pure Honey'),
              ddPhoto('tahina', 'Tahina'),
              ddVideo('royal-arm-foul-medammes', 'Royal Arm Foul Medammes'),
              ddVideo('peri-peri-sauce', 'Peri Peri Sauce'),
            ],
          },
        ],
      },
      {
        slug: 'cocozuri-social',
        name: 'CocoZuri',
        projects: [
          {
            slug: 'cocozuri-social',
            title: 'CocoZuri',
            tone: 'oxblood',
            cover: `${CZ}/pistachio-kunafa-bites-2.jpg`,
            summary: 'Social media for CocoZuri Chocolat, handmade chocolates from Dar es Salaam: a series of still lifes for each bonbon, truffle and kunafa bite, planned as a feed where no two pictures repeat.',
            images: [
              czPhoto('dark-almond-delight-2', 'Dark Almond Delight'),
              czPhoto('guava-tamarind-1', 'Guava Tamarind'),
              czPhoto('milk-chocolate-peanut-butter-2', 'Milk Chocolate Peanut Butter'),
              czPhoto('hazelnut-kunafa-bites-1', 'Hazelnut Kunafa Bites'),
              czPhoto('fresh-mint-1', 'Fresh Mint'),
              czPhoto('yuzu-mango-2', 'Yuzu Mango'),
              czPhoto('salted-caramel-and-saffron-2', 'Salted Caramel & Saffron'),
              czPhoto('pistachio-date-kunafa-frame-2', 'Pistachio Date Kunafa Frame'),
              czPhoto('amber-rabdi-5', 'Amber Rabdi'),
              czPhoto('karak-chai-4', 'Karak Chai'),
              czPhoto('dark-chocolate-rocks-2', 'Dark Chocolate Rocks'),
              czPhoto('kunafa-eclat-2', 'Kunafa Eclat'),
              czPhoto('choco-hazelle-1', 'Choco Hazelle'),
              czPhoto('dates-kunafa-bites-2', 'Dates Kunafa Bites'),
              czPhoto('praline-feuilletine-2', 'Praline Feuilletine'),
              czPhoto('milk-chocolate-nutella-1', 'Milk Chocolate Nutella'),
              czPhoto('pistachio-kunafa-bites-2', 'Pistachio Kunafa Bites'),
              czPhoto('fresh-mint-2', 'Fresh Mint'),
              czPhoto('raspberry-and-dark-chocolate-1', 'Raspberry & Dark Chocolate'),
              czPhoto('coffee-praline-ganache-2', 'Coffee Praline Ganache'),
              czPhoto('assorted-dates-2', 'Assorted Dates'),
              czPhoto('custard-cinnamon-1', 'Custard Cinnamon'),
              czPhoto('animals-4', 'Animals'),
              czPhoto('white-chocolate-pistachio-truffle-1', 'White Chocolate Pistachio'),
              czPhoto('guava-tamarind-2', 'Guava Tamarind'),
              czPhoto('dark-almond-delight-1', 'Dark Almond Delight'),
              czPhoto('white-chocolate-kunafa-bite-1', 'White Chocolate Kunafa Bite'),
              czPhoto('karak-chai-5', 'Karak Chai'),
              czPhoto('choco-hazelle-2', 'Choco Hazelle'),
              czPhoto('lemon-caramel-2', 'Lemon Caramel'),
              czPhoto('kunafa-eclat-1', 'Kunafa Eclat'),
              czPhoto('dark-chocolate-rocks-1', 'Dark Chocolate Rocks'),
              czPhoto('nutty-fudge-1', 'Nutty Fudge'),
              czPhoto('ginger-caramel-2', 'Ginger Caramel'),
              czPhoto('assorted-dates-1', 'Assorted Dates'),
              czPhoto('salted-caramel-and-saffron-1', 'Salted Caramel & Saffron'),
              czPhoto('pistachio-kunafa-bites-1', 'Pistachio Kunafa Bites'),
              czPhoto('amber-rabdi-1', 'Amber Rabdi'),
              czPhoto('honey-hazelnut-2', 'Honey Hazelnut'),
              czPhoto('praline-feuilletine-1', 'Praline Feuilletine'),
              czPhoto('milk-chocolate-peanut-butter-1', 'Milk Chocolate Peanut Butter'),
              czPhoto('sugarcane-and-tamarind-1', 'Sugarcane & Tamarind'),
              czPhoto('karak-chai-2', 'Karak Chai'),
              czPhoto('strawberry-and-basil-2', 'Strawberry & Basil'),
              czPhoto('vanilla-and-passion-2', 'Vanilla & Passion'),
              czPhoto('animals-2', 'Animals'),
              czPhoto('white-chocolate-kunafa-bite-2', 'White Chocolate Kunafa Bite'),
              czPhoto('yuzu-mango-1', 'Yuzu Mango'),
              czPhoto('raspberry-and-dark-chocolate-2', 'Raspberry & Dark Chocolate'),
              czPhoto('amber-rabdi-3', 'Amber Rabdi'),
              czPhoto('lemon-and-chilli-1', 'Lemon & Chilli'),
              czPhoto('dates-kunafa-bites-1', 'Dates Kunafa Bites'),
              czPhoto('honey-hazelnut-1', 'Honey Hazelnut'),
              czPhoto('nutty-fudge-2', 'Nutty Fudge'),
              czPhoto('karak-chai-1', 'Karak Chai'),
              czPhoto('sugarcane-and-tamarind-2', 'Sugarcane & Tamarind'),
              czPhoto('white-chocolate-pistachio-truffle-2', 'White Chocolate Pistachio'),
              czPhoto('strawberry-and-basil-1', 'Strawberry & Basil'),
              czPhoto('lemon-caramel-1', 'Lemon Caramel'),
              czPhoto('pistachio-date-kunafa-frame-1', 'Pistachio Date Kunafa Frame'),
              czPhoto('ginger-caramel-1', 'Ginger Caramel'),
              czPhoto('amber-rabdi-2', 'Amber Rabdi'),
              czPhoto('hazelnut-kunafa-bites-2', 'Hazelnut Kunafa Bites'),
              czPhoto('milk-chocolate-nutella-2', 'Milk Chocolate Nutella'),
              czPhoto('vanilla-and-passion-1', 'Vanilla & Passion'),
            ],
          },
        ],
      },
      { slug: 'terragreen', name: 'TerraGreen', listed: true, projects: [soon('terragreen-soon', 'sage')] },
      { slug: 'pamoja-plus', name: 'Pamoja Plus', listed: true, projects: [soon('pamoja-plus-soon', 'amber')] },
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

/** Only what has pictures: empty sub-categories and categories are left out of every list on the site. */
export const visibleCategories = (): Category[] => categories
  .map((c) => ({
    ...c,
    subcategories: c.subcategories
      .map((s) => ({ ...s, projects: s.projects.filter(hasPage) }))
      .filter((s) => s.projects.length),
  }))
  .filter((c) => c.subcategories.length);

/** Categories have their own page at /work/<category>, sharing the address space with projects. */
export const findCategory = (slug: string) => categories.find((c) => c.slug === slug);
/** A category gets a full page once any of its projects has pictures. */
export const categoryHasWork = (c: Category) => c.subcategories.some((s) => s.projects.some(hasPage));
/** How many sub-categories the Work filter lists before linking to the category page. */
export const FILTER_SUBS = 5;
