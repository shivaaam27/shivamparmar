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
export type WorkImage = {
  src: string; alt: string; caption?: string; video?: string;
  /** a screen (recording or screenshot): shown whole in the tiles and the viewer, never cropped */
  screen?: boolean;
  /** a second, frame-matched recording of the same video: the project page shows both with a slider between them */
  compare?: { video: string; poster: string; label: string; otherLabel: string };
};

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
  /** a live address, shown as a link under the summary */
  link?: { label: string; href: string; title?: string };
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


/** A website: one project holding its landscape walkthrough video, with a link to the live site. */
const WEB = '/images/websites';
const site = (slug: string, name: string, file: string, tone: Tone, summary: string, label: string, path: string): Subcategory => ({
  slug, name,
  projects: [{
    slug, title: name, tone, cover: `${WEB}/${file}-poster.jpg`, summary,
    link: { label: 'Visit the website', href: `https://oracleconsultancygroup.vercel.app${path}`, title: label },
    images: [{ src: `${WEB}/${file}-poster.jpg`, video: `${WEB}/${file}.mp4`, alt: `${name} website: a walkthrough recording`, caption: 'Website walkthrough', screen: true }],
  }],
});
/** V1 was recorded twice, by day and by night, frame for frame: the day run plays, with the night run beside it to compare. */
const withCompare = (sub: Subcategory, compare: NonNullable<WorkImage['compare']>, video: string): Subcategory => ({
  ...sub,
  projects: sub.projects.map((p) => ({
    ...p,
    images: p.images?.map((img) => ({ ...img, video, compare, caption: 'Website walkthrough · day and night' })),
  })),
});

export const categories: Category[] = [
  {
    slug: 'systems',
    name: 'Systems',
    subcategories: [
      {
        slug: 'task-management-system',
        name: 'Task management system',
        projects: [
          {
            slug: 'task-management',
            title: 'Task Management',
            tone: 'ink',
            summary: 'Built in-house, and the first in Tanzania: an advanced task management system for a group of companies. One place for every task and every company file, across every company, with permits and certificates flagged before they need renewing.',
            link: { label: 'Open the sign-in page', href: 'https://oracleconsultancy.vercel.app/login', title: 'oracleconsultancy.vercel.app' },
            images: [
              { src: '/images/work-signin.jpg', alt: 'Two people at a monitor showing the Task Management sign-in screen', caption: 'Sign in' },
              { src: '/images/work-dashboard.jpg', alt: 'Someone at a laptop surrounded by floating panels of the Task Management dashboard', caption: 'Dashboard' },
              { src: '/images/work-dashboard-ipad.jpg', alt: 'A hand with a stylus over an iPad showing the Task Management dashboard', caption: 'Dashboard on iPad' },
              { src: '/images/work-files.jpg', alt: 'Two people at a monitor showing the files section of the Task Management system', caption: 'Files' },
              { src: '/images/task-management/sign-in-desktop.jpg', alt: 'The Task Management sign-in page on a desktop screen: sign in on the left, the Task Management title and a bar pattern on the right', caption: 'Sign in · desktop', screen: true },
              { src: '/images/task-management/sign-in-mobile.jpg', alt: 'The Task Management sign-in page on a phone', caption: 'Sign in · mobile', screen: true },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'tools',
    name: 'Tools',
    subcategories: [
      {
        slug: 'shivo-labs',
        name: 'Shivo Labs',
        projects: [
          {
            slug: 'shivo-labs',
            title: 'Shivo Labs',
            tone: 'sage',
            cover: '/images/shivo-labs/home.jpg',
            summary: 'A Windows app that puts your own iPhone and iPad apps on your devices, no Mac needed. It installs in a few clicks, sets up everything the PC needs by itself, finds the apps already on the computer, and renews them every week with one button. It also has a guide built in, and updates itself.',
            images: [
              { src: '/images/shivo-labs/splash.jpg', alt: 'The Shivo Labs logo, six tiles leaning forward like an arrow with a sage tip, and the words Shivo Labs, X Tools', caption: 'Opening', screen: true },
              { src: '/images/shivo-labs/installer-welcome.jpg', alt: 'The Shivo Labs installer: Install Shivo Labs, where it installs, and an Install button', caption: 'Installer', screen: true },
              { src: '/images/shivo-labs/installer-working.jpg', alt: 'The Shivo Labs installer copying files, with a progress bar', caption: 'Installing', screen: true },
              { src: '/images/shivo-labs/installer-finished.jpg', alt: 'The Shivo Labs installer finished: Shivo Labs is ready, with an Open Shivo Labs button', caption: 'Ready', screen: true },
              { src: '/images/shivo-labs/setup.jpg', alt: 'Set up this PC: Linux for Windows ready, the Shivo Labs engine installing, Apple iPhone drivers ready', caption: 'Setting up the PC', screen: true },
              { src: '/images/shivo-labs/connected.jpg', alt: 'An iPhone outline with the Shivo Labs mark, the phone’s name and Connected', caption: 'iPhone connected', screen: true },
              { src: '/images/shivo-labs/home.jpg', alt: 'Your apps: two installed apps with days left and Renew buttons, and two .ipa files found on the PC', caption: 'Your apps', screen: true },
              { src: '/images/shivo-labs/install.jpg', alt: 'An app installing, signing with Apple, 58 percent', caption: 'Installing an app', screen: true },
              { src: '/images/shivo-labs/done.jpg', alt: 'App installed, with the two one-time iPhone settings: Developer Mode and trusting the Apple ID', caption: 'Installed', screen: true },
              { src: '/images/shivo-labs/guide.jpg', alt: 'The built-in guide, its sections from Before you start to Limits of a free Apple ID', caption: 'Guide', screen: true },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'websites',
    name: 'Websites',
    subcategories: [
      site('oracle-consultancy-group', 'Oracle Consultancy Group', 'group', 'ink',
        'The website for Oracle Consultancy Group of Companies: ten companies across FMCG, manufacturing, supply chain and mining services in Tanzania, India and the UAE, supported by one team for operations, HR, accounting and recruitment.',
        'oracleconsultancygroup.vercel.app', '/'),
      site('terragreen-website', 'TerraGreen', 'terragreen', 'sage',
        'Terra Green imports, distributes and markets premium fresh fruit and produce from growing regions around the world, supplying supermarkets, hotels, restaurants and wholesalers across Tanzania.',
        'oracleconsultancygroup.vercel.app/terragreen', '/terragreen/'),
      site('cocozuri-website', 'CocoZuri', 'cocozuri', 'oxblood',
        'CocoZuri Chocolat makes artisanal chocolate in small batches in Dar es Salaam: Belgian couverture with Tanzanian fruit, spice and nuts, tempered, filled and finished by hand in Masaki.',
        'oracleconsultancygroup.vercel.app/cocozuri', '/cocozuri/'),
      withCompare(site('v1-supermarket-website', 'V1 Supermarket', 'v1', 'stone',
        'V1 Supermarket, a neighbourhood supermarket in Kisutu, Dar es Salaam, as a 3D store: the site opens on a landing page, then moves into the shop itself, where customers can explore and search the products on its shelves.',
        'oracleconsultancygroup.vercel.app/v1supermarket', '/v1supermarket/'),
        { video: `${WEB}/v1-night.mp4`, poster: `${WEB}/v1-night-poster.jpg`, label: 'Day', otherLabel: 'Night' }, `${WEB}/v1-day.mp4`),
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
              ddPhoto('bbq-sauce-hickory', 'BBQ Sauce Hickory'),
              ddPhoto('cream-style-sweet-corn', 'Cream Style Sweet Corn'),
              ddPhoto('whole-kernel-sweet-corn', 'Whole Kernel Sweet Corn'),
              ddPhoto('halawa-pistachio', 'Halawa Pistachio'),
              ddPhoto('eggless-mayonnaise', 'Eggless Mayonnaise'),
              ddPhoto('caesar-dressing', 'Caesar Dressing'),
              ddPhoto('peri-peri-mayonnaise', 'Peri-Peri Mayonnaise'),
              ddPhoto('semolina', 'Semolina'),
              ddPhoto('khushi-sliced-mushrooms', 'Khushi Sliced Mushrooms'),
              ddPhoto('seasons-harvest-whole-mushroom', 'Seasons Harvest Whole Mushroom'),
              ddPhoto('zahara-rose-syrup', 'Zahara Rose Syrup'),
              ddPhoto('oreo', 'Oreo'),
              ddPhoto('gopal-apple-vinegar', 'Gopal Apple Vinegar'),
              ddPhoto('gopal-tamarind-sauce', 'Gopal Tamarind Sauce'),
              ddPhoto('gopal-habanero-hot-sauce', 'Gopal Habanero Hot Sauce'),
              ddPhoto('gopal-peri-peri-sauce', 'Gopal Peri Peri Sauce'),
              ddPhoto('gopal-ginger-garlic-paste', 'Gopal Ginger Garlic Paste'),
              ddPhoto('gopal-mustard-paste', 'Gopal Mustard Paste'),
              ddVideo('gopal-pizza-and-pasta-sauce', 'Gopal Pizza & Pasta Sauce'),
              ddVideo('gopal-chilli-garlic-sauce', 'Gopal Chilli Garlic Sauce'),
              ddPhoto('gopal-sriracha-sauce', 'Gopal Sriracha Sauce'),
              ddPhoto('gopal-mayonnaise', 'Gopal Mayonnaise'),
              ddPhoto('gopal-mint-mayonnaise', 'Gopal Mint Mayonnaise'),
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
            summary: 'Social media for CocoZuri Chocolat, handmade chocolates from Dar es Salaam: a series of still lifes for every bonbon, truffle, kunafa bite, bar and gift box on the menu, in one colour grade, planned as a feed where no two pictures repeat.',
            images: [
              czPhoto('christmas-edition-3', 'Christmas Edition'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-1', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('corporate-gifting-edition-1', 'Corporate Gifting Edition'),
              czPhoto('dark-almond-delight-1', 'Dark Almond Delight'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-1', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('ramadan-edition-2', 'Ramadan Edition'),
              czPhoto('hazelnut-kunafa-bites-1', 'Hazelnut Kunafa Bites'),
              czPhoto('honey-hazelnut-1', 'Honey Hazelnut'),
              czPhoto('animals-4', 'Animals'),
              czPhoto('hazelnut-kunafa-tablet-2', 'Hazelnut Kunafa Tablet'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-1', '50% Dark Chocolate Bar 100gm'),
              czPhoto('amber-rabdi-3', 'Amber Rabdi'),
              czPhoto('ramadan-edition-3', 'Ramadan Edition'),
              czPhoto('colour-pop-bar-50gm-2', 'Colour Pop Bar 50gm'),
              czPhoto('strawberry-and-basil-2', 'Strawberry & Basil'),
              czPhoto('dark-chocolate-rocks-1', 'Dark Chocolate Rocks'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-220gm-1', 'Pistachio Kunafa Milk Chocolate Bar 220gm'),
              czPhoto('christmas-edition-1', 'Christmas Edition'),
              czPhoto('amber-rabdi-2', 'Amber Rabdi'),
              czPhoto('milk-chocolate-peanut-butter-1', 'Milk Chocolate Peanut Butter'),
              czPhoto('choco-hazelle-2', 'Choco Hazelle'),
              czPhoto('sugarcane-and-tamarind-2', 'Sugarcane & Tamarind'),
              czPhoto('vanilla-and-passion-1', 'Vanilla & Passion'),
              czPhoto('pistachio-kunafa-bites-2', 'Pistachio Kunafa Bites'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-5', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('pistachio-date-kunafa-frame-2', 'Pistachio Date Kunafa Frame'),
              czPhoto('pistachio-kunafa-bite-30gm-1', 'Pistachio Kunafa Bite 30gm'),
              czPhoto('signature-blue-box-of-12-1', 'Signature Blue Box of 12'),
              czPhoto('lemon-caramel-1', 'Lemon Caramel'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-6', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('christmas-edition-2', 'Christmas Edition'),
              czPhoto('custard-cinnamon-2', 'Custard Cinnamon'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-3', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-3', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('dates-kunafa-bites-2', 'Dates Kunafa Bites'),
              czPhoto('white-chocolate-kunafa-bite-2', 'White Chocolate Kunafa Bite'),
              czPhoto('animals-1', 'Animals'),
              czPhoto('dark-chocolate-rocks-2', 'Dark Chocolate Rocks'),
              czPhoto('coffee-praline-ganache-2', 'Coffee Praline Ganache'),
              czPhoto('assorted-dates-1', 'Assorted Dates'),
              czPhoto('dark-almond-delight-2', 'Dark Almond Delight'),
              czPhoto('yuzu-mango-2', 'Yuzu Mango'),
              czPhoto('amber-rabdi-1', 'Amber Rabdi'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-3', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('amber-rabdi-5', 'Amber Rabdi'),
              czPhoto('dark-chocolate-oreo-fudge-4', 'Dark Chocolate Oreo Fudge'),
              czPhoto('pistachio-kunafa-bite-50gm-2', 'Pistachio Kunafa Bite 50gm'),
              czPhoto('praline-feuilletine-2', 'Praline Feuilletine'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-1', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-3', '80% Dark Chocolate Bar 50gm'),
              czPhoto('pistachio-date-kunafa-frame-1', 'Pistachio Date Kunafa Frame'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-2', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('white-chocolate-kunafa-bite-1', 'White Chocolate Kunafa Bite'),
              czPhoto('festive-box-of-4-1', 'Festive Box of 4'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-4', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('colour-pop-bar-50gm-3', 'Colour Pop Bar 50gm'),
              czPhoto('assorted-dates-2', 'Assorted Dates'),
              czPhoto('hazelnut-kunafa-tablet-1', 'Hazelnut Kunafa Tablet'),
              czPhoto('milk-chocolate-peanut-butter-2', 'Milk Chocolate Peanut Butter'),
              czPhoto('nutty-fudge-2', 'Nutty Fudge'),
              czPhoto('colour-pop-bar-50gm-4', 'Colour Pop Bar 50gm'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-100gm-3', 'Pistachio Kunafa Milk Chocolate Bar 100gm'),
              czPhoto('animals-2', 'Animals'),
              czPhoto('hazelnut-dragees-100gm-2', 'Hazelnut Dragees 100gm'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-slab-1', '50% Dark Chocolate Cashew Sea Salt Slab'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-2', '80% Dark Chocolate Bar 50gm'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-100gm-1', 'Pistachio Kunafa Milk Chocolate Bar 100gm'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-2', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('praline-feuilletine-1', 'Praline Feuilletine'),
              czPhoto('dark-chocolate-oreo-fudge-2', 'Dark Chocolate Oreo Fudge'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-5', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('ginger-caramel-2', 'Ginger Caramel'),
              czPhoto('fresh-mint-2', 'Fresh Mint'),
              czPhoto('white-chocolate-pistachio-truffle-1', 'White Chocolate Pistachio (truffle)'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-1', '80% Dark Chocolate Bar 50gm'),
              czPhoto('dates-kunafa-bites-1', 'Dates Kunafa Bites'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-4', '50% Dark Chocolate Bar 100gm'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-1', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('pistachio-kunafa-bite-50gm-1', 'Pistachio Kunafa Bite 50gm'),
              czPhoto('white-elegance-box-2', 'White Elegance Box'),
              czPhoto('strawberry-and-basil-1', 'Strawberry & Basil'),
              czPhoto('50-percent-dark-chocolate-roasted-almond-slab-1', '50% Dark Chocolate Roasted Almond Slab'),
              czPhoto('kunafa-eclat-2', 'Kunafa Eclat'),
              czPhoto('cream-royale-box-4', 'Cream Royale Box'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-4', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('lemon-caramel-2', 'Lemon Caramel'),
              czPhoto('pistachio-kunafa-bites-1', 'Pistachio Kunafa Bites'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-220gm-2', '50% Dark Chocolate Pistachio Kunafa Bar 220gm'),
              czPhoto('fresh-mint-1', 'Fresh Mint'),
              czPhoto('pistachio-kunafa-bite-50gm-3', 'Pistachio Kunafa Bite 50gm'),
              czPhoto('cream-royale-box-2', 'Cream Royale Box'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-3', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('milk-chocolate-nutella-2', 'Milk Chocolate Nutella'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-1', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('magnetic-box-of-6-1', 'Magnetic Box of 6'),
              czPhoto('karak-chai-1', 'Karak Chai'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-2', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('50-percent-dark-chocolate-roasted-almond-slab-2', '50% Dark Chocolate Roasted Almond Slab'),
              czPhoto('colour-pop-bar-50gm-1', 'Colour Pop Bar 50gm'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-slab-2', '50% Dark Chocolate Cashew Sea Salt Slab'),
              czPhoto('karak-chai-2', 'Karak Chai'),
              czPhoto('cream-royale-box-1', 'Cream Royale Box'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-100gm-2', 'Pistachio Kunafa Milk Chocolate Bar 100gm'),
              czPhoto('custard-cinnamon-1', 'Custard Cinnamon'),
              czPhoto('lemon-and-chilli-1', 'Lemon & Chilli'),
              czPhoto('ginger-caramel-1', 'Ginger Caramel'),
              czPhoto('cream-royale-box-3', 'Cream Royale Box'),
              czPhoto('hazelnut-dragees-100gm-1', 'Hazelnut Dragees 100gm'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-7', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('pistachio-kunafa-bite-30gm-2', 'Pistachio Kunafa Bite 30gm'),
              czPhoto('milk-chocolate-nutella-1', 'Milk Chocolate Nutella'),
              czPhoto('honey-hazelnut-2', 'Honey Hazelnut'),
              czPhoto('hazelnut-dragees-100gm-3', 'Hazelnut Dragees 100gm'),
              czPhoto('karak-chai-5', 'Karak Chai'),
              czPhoto('lego-bites-1', 'Lego Bites'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-3', '50% Dark Chocolate Bar 100gm'),
              czPhoto('magnetic-box-of-6-2', 'Magnetic Box of 6'),
              czPhoto('karak-chai-4', 'Karak Chai'),
              czPhoto('dark-chocolate-oreo-fudge-3', 'Dark Chocolate Oreo Fudge'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-5', '80% Dark Chocolate Bar 50gm'),
              czPhoto('almond-dragees-100gm-1', 'Almond Dragees 100gm'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-2', '50% Dark Chocolate Bar 100gm'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-4', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('guava-tamarind-1', 'Guava Tamarind'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-220gm-2', 'Pistachio Kunafa Milk Chocolate Bar 220gm'),
              czPhoto('festive-box-of-4-2', 'Festive Box of 4'),
              czPhoto('raspberry-and-dark-chocolate-2', 'Raspberry & Dark Chocolate'),
              czPhoto('lego-bites-2', 'Lego Bites'),
              czPhoto('diwali-edition-2', 'Diwali Edition'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-6', '80% Dark Chocolate Bar 50gm'),
              czPhoto('guava-tamarind-2', 'Guava Tamarind'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-2', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('kunafa-eclat-1', 'Kunafa Eclat'),
              czPhoto('white-chocolate-pistachio-truffle-2', 'White Chocolate Pistachio (truffle)'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-220gm-3', 'Pistachio Kunafa Milk Chocolate Bar 220gm'),
              czPhoto('dark-chocolate-oreo-fudge-1', 'Dark Chocolate Oreo Fudge'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-6', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('white-chocolate-pistachio-slab-1', 'White Chocolate Pistachio Slab'),
              czPhoto('choco-hazelle-1', 'Choco Hazelle'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-4', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('signature-blue-box-of-12-2', 'Signature Blue Box of 12'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-4', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('yuzu-mango-1', 'Yuzu Mango'),
              czPhoto('corporate-gifting-edition-2', 'Corporate Gifting Edition'),
              czPhoto('vanilla-and-passion-2', 'Vanilla & Passion'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-220gm-1', '50% Dark Chocolate Pistachio Kunafa Bar 220gm'),
              czPhoto('salted-caramel-and-saffron-1', 'Salted Caramel & Saffron'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-2', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-4', '80% Dark Chocolate Bar 50gm'),
              czPhoto('karak-chai-6', 'Karak Chai'),
              czPhoto('sugarcane-and-tamarind-1', 'Sugarcane & Tamarind'),
              czPhoto('coffee-praline-ganache-1', 'Coffee Praline Ganache'),
              czPhoto('animals-3', 'Animals'),
              czPhoto('hazelnut-kunafa-bites-2', 'Hazelnut Kunafa Bites'),
              czPhoto('karak-chai-3', 'Karak Chai'),
              czPhoto('diwali-edition-1', 'Diwali Edition'),
              czPhoto('raspberry-and-dark-chocolate-1', 'Raspberry & Dark Chocolate'),
              czPhoto('salted-caramel-and-saffron-2', 'Salted Caramel & Saffron'),
              czPhoto('white-elegance-box-1', 'White Elegance Box'),
              czPhoto('nutty-fudge-1', 'Nutty Fudge'),
              czPhoto('almond-dragees-100gm-3', 'Almond Dragees 100gm'),
              czPhoto('white-chocolate-pistachio-slab-3', 'White Chocolate Pistachio Slab'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-3', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('animals-5', 'Animals'),
              czPhoto('lemon-and-chilli-2', 'Lemon & Chilli'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-5', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('white-chocolate-pistachio-slab-2', 'White Chocolate Pistachio Slab'),
              czPhoto('almond-dragees-100gm-2', 'Almond Dragees 100gm'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-5', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('amber-rabdi-4', 'Amber Rabdi'),
              czPhoto('ramadan-edition-1', 'Ramadan Edition'),
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
