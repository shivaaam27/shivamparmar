import type { Tone } from './content';
import { copy } from './copy';

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
  /** a longer description, one string per paragraph (the project page shows it under the summary) */
  details?: string[];
  images?: WorkImage[];
  /** a live address, shown as a link under the summary (always: shown even while SHOW_PROJECT_LINKS is off) */
  /** embed: open inside the site's own frame (the site must allow it; see EMBED_ORIGINS in lib/headers.ts) */
  link?: { label: string; href: string; title?: string; always?: boolean; embed?: boolean };
};

/** listed: show it on the work page as "Soon" even before it has work. */
export type Subcategory = { slug: string; name: string; projects: Project[]; listed?: boolean };
/** `cover`: the picture that stands for the whole category where it is shown as one tile (the work page). */
export type Category = { slug: string; name: string; cover?: string; subcategories: Subcategory[] };

const soon = (slug: string, tone: Tone): Project => ({ slug, title: 'Coming soon', tone });

/** A piece of software: its own collection, held as a title and a description until it has pictures. */
const soft = (slug: string, name: string, summary: string): Subcategory => {
  // the words are kept in content/site-text.json (npm run text:edit); the ones here are the fallback
  const title = copy(`software.${slug}.title`, name);
  return { slug, name: title, listed: true, projects: [{ slug, title, tone: 'ink', summary: copy(`software.${slug}.text`, summary) }] };
};

/** CocoZuri's chocolate photographs, ordered so no two look-alike pictures sit near each other. */
const CZ = '/images/cocozuri-social';
const czPhoto = (slug: string, title: string): WorkImage =>
  ({ src: `${CZ}/${slug}.jpg`, alt: `${title}: chocolate photograph for CocoZuri’s social media`, caption: title });


/**
 * Links from a project page to the live site or system. Off for now (Shivam, 20 Oct 2026): the sites and the task system
 * are still being finished. The addresses stay below; set this to true to show the links again.
 */
export const SHOW_PROJECT_LINKS = false;

/** A website: one project holding its landscape walkthrough video, with a link to the live site. */
const WEB = '/images/websites';
const site = (slug: string, name: string, file: string, tone: Tone, summary: string, label: string, path: string): Subcategory => ({
  slug, name,
  projects: [{
    slug, title: name, tone, cover: `${WEB}/${file}-poster.jpg`, summary,
    link: { label: 'Visit the website', href: path.startsWith('https://') ? path : `https://oracleconsultancygroup.vercel.app${path}`, title: label },
    images: [{ src: `${WEB}/${file}-poster.jpg`, video: `${WEB}/${file}.mp4`, alt: `${name} website: a walkthrough recording`, caption: 'Website walkthrough', screen: true }],
  }],
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
            link: { label: 'Download for Windows and Android', href: '/get', title: 'shivolabs.com/get', always: true },
            summary: 'A Windows app that puts your own iPhone and iPad apps on your devices, no Mac needed. It installs in a few clicks, sets up everything the PC needs by itself, finds the apps already on the computer, and renews them every week with one button. It also has a guide built in, and updates itself.',
          },
        ],
      },
    ],
  },
  {
    slug: 'software',
    name: 'Software',
    // Everything built and shipped, one collection each, with what it is. No pictures yet: on the work page each shows as a
    // title and its description, and a picture or a recording added to the project turns it into a full project page.
    subcategories: [
      soft('task-management-platform', 'Task management platform',
        'For a group of companies, on the web, Android and iPhone: user portals, live progress updates and admin workflows, from version 1 to 3 in five months.'),
      soft('ai-document-agent', 'AI document agent',
        'Reads, renames, tags and files company documents into a linked master register, with a quarantine step and no deletions.'),
      soft('compliance-alert-engine', 'Compliance alert engine',
        'Tracks permits, visas, contracts and payments, with tiered reminders and weekly and monthly digests.'),
      soft('custom-mcp-server', 'Custom MCP server',
        'Runs the whole platform from a chat with Claude, packaged with Docker for self-hosting.'),
      soft('ai-image-pipeline', 'AI image pipeline',
        'Makes natural, on-brand product images in batches of 120 to 200, saving about six hours per batch.'),
      soft('product-hub', 'Shivo Labs Hub',
        'All Shivo Labs Apps in One Place. One app that holds every Shivo Labs tool. Updates install automatically. Works on Windows, iPhone and Android.'),
      soft('product-ai', 'Shivo Labs AI',
        'AI Assistant for Windows. Ask questions, write and edit documents, and write code. Works with the files on your computer. Works on Windows.'),
      soft('product-chat', 'Shivo Labs Chat',
        'Team and Personal Messaging. Message your team, friends and family one to one or in groups, and share photos and files. Works on phone and computer. Works on iPhone, Android and Windows.'),
      soft('product-cloud', 'Shivo Labs Cloud',
        'File Storage. Keep your files in one place and open them on your phone or computer. Works on iPhone and Windows.'),
      soft('product-beam', 'Shivo Labs Beam',
        'File Transfer over Wi-Fi. Send photos, videos and documents from an iPhone to a Windows computer. Works on iPhone and Windows.'),
      soft('product-mirror', 'Shivo Labs Mirror',
        'iPhone Screen on Your Computer. Show your iPhone screen on a Windows computer without a cable, for presentations or screen recording. AI agents can see the screen too, so they can find and fix problems in your app. Works on iPhone and Windows.'),
      soft('product-tools', 'Shivo Labs iPhone App Signing',
        'Build and Install iPhone Apps on Windows. Build, install and update your own iPhone apps from a Windows computer over Wi-Fi, and renew them before they expire. No Mac needed. Works on Windows and iPhone.'),
      soft('product-tv', 'Shivo Labs TV',
        'Home Screen for Android TV. A clean home screen for your TV without the preinstalled apps you never use. It shows your apps, recent shows and inputs, adds extra smart features, and turns your phone into a smart remote. Works on Android TV and Google TV.'),
      soft('product-camera', 'Shivo Labs Camera',
        'Camera App for iPhone. Take photos with film-style colour, using looks we made ourselves. Works on iPhone.'),
      soft('product-website-insights', 'Shivo Labs Website Insights',
        'Website Visitor Reports. See how many people visit your website, where they come from and which pages they read. No cookies, and bots are filtered out. Works on Web.'),
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
      site('v1-supermarket-website', 'V1 Supermarket', 'v1', 'stone',
        'V1 Supermarket is a one-stop mini mart in the city centre of Dar es Salaam, on Zanaki Street in Kisutu: groceries, fresh produce, cold drinks, household and personal care products at competitive prices, with orders by WhatsApp or phone and delivery across the city centre.',
        'v1.co.tz', 'https://v1.co.tz/'),
      site('dar-distributors-website', 'Dar Distributors', 'dar-distributors', 'oxblood',
        'Dar Distributors is a Tanzanian FMCG wholesale and distribution company in Dar es Salaam, bringing quality food brands into Tanzania and keeping them in stock for hotels, restaurants and caterers, shops, wholesalers and corporate buyers: more than 800 products from over 20 brands.',
        'dardistributors.com', 'https://dardistributors.com/'),
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    cover: '/images/mikumi-elephants.jpg',
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
            summary: 'Social media for Dar Distributors, wholesale food suppliers in Dar es Salaam: product photographs and short videos for the Virginia Green Garden, Golden Royal and Royal Arm ranges, posted in English and Kiswahili.',
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
              czPhoto('dark-almond-delight-1', 'Dark Almond Delight'),
              czPhoto('hazelnut-kunafa-bites-1', 'Hazelnut Kunafa Bites'),
              czPhoto('honey-hazelnut-1', 'Honey Hazelnut'),
              czPhoto('animals-4', 'Animals'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-1', '50% Dark Chocolate Bar 100gm'),
              czPhoto('amber-rabdi-3', 'Amber Rabdi'),
              czPhoto('strawberry-and-basil-2', 'Strawberry & Basil'),
              czPhoto('dark-chocolate-rocks-1', 'Dark Chocolate Rocks'),
              czPhoto('christmas-edition-1', 'Christmas Edition'),
              czPhoto('amber-rabdi-2', 'Amber Rabdi'),
              czPhoto('milk-chocolate-peanut-butter-1', 'Milk Chocolate Peanut Butter'),
              czPhoto('choco-hazelle-2', 'Choco Hazelle'),
              czPhoto('sugarcane-and-tamarind-2', 'Sugarcane & Tamarind'),
              czPhoto('vanilla-and-passion-1', 'Vanilla & Passion'),
              czPhoto('pistachio-kunafa-bites-2', 'Pistachio Kunafa Bites'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-5', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('pistachio-date-kunafa-frame-2', 'Pistachio Date Kunafa Frame'),
              czPhoto('signature-blue-box-of-12-1', 'Signature Blue Box of 12'),
              czPhoto('lemon-caramel-1', 'Lemon Caramel'),
              czPhoto('80-percent-dark-chocolate-pecan-nuts-bar-100gm-6', '80% Dark Chocolate Pecan Nuts Bar 100gm'),
              czPhoto('custard-cinnamon-2', 'Custard Cinnamon'),
              czPhoto('dates-kunafa-bites-2', 'Dates Kunafa Bites'),
              czPhoto('white-chocolate-kunafa-bite-2', 'White Chocolate Kunafa Bite'),
              czPhoto('animals-1', 'Animals'),
              czPhoto('dark-chocolate-rocks-2', 'Dark Chocolate Rocks'),
              czPhoto('coffee-praline-ganache-2', 'Coffee Praline Ganache'),
              czPhoto('dark-almond-delight-2', 'Dark Almond Delight'),
              czPhoto('yuzu-mango-2', 'Yuzu Mango'),
              czPhoto('amber-rabdi-1', 'Amber Rabdi'),
              czPhoto('amber-rabdi-5', 'Amber Rabdi'),
              czPhoto('pistachio-kunafa-bite-50gm-2', 'Pistachio Kunafa Bite 50gm'),
              czPhoto('praline-feuilletine-2', 'Praline Feuilletine'),
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
              czPhoto('animals-2', 'Animals'),
              czPhoto('hazelnut-dragees-100gm-2', 'Hazelnut Dragees 100gm'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-slab-1', '50% Dark Chocolate Cashew Sea Salt Slab'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-2', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('praline-feuilletine-1', 'Praline Feuilletine'),
              czPhoto('ginger-caramel-2', 'Ginger Caramel'),
              czPhoto('fresh-mint-2', 'Fresh Mint'),
              czPhoto('white-chocolate-pistachio-truffle-1', 'White Chocolate Pistachio (truffle)'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-1', '80% Dark Chocolate Bar 50gm'),
              czPhoto('dates-kunafa-bites-1', 'Dates Kunafa Bites'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-4', '50% Dark Chocolate Bar 100gm'),
              czPhoto('pistachio-kunafa-bite-50gm-1', 'Pistachio Kunafa Bite 50gm'),
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
              czPhoto('karak-chai-1', 'Karak Chai'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-2', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('colour-pop-bar-50gm-1', 'Colour Pop Bar 50gm'),
              czPhoto('karak-chai-2', 'Karak Chai'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-100gm-2', 'Pistachio Kunafa Milk Chocolate Bar 100gm'),
              czPhoto('custard-cinnamon-1', 'Custard Cinnamon'),
              czPhoto('lemon-and-chilli-1', 'Lemon & Chilli'),
              czPhoto('ginger-caramel-1', 'Ginger Caramel'),
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
              czPhoto('80-percent-dark-chocolate-bar-50gm-5', '80% Dark Chocolate Bar 50gm'),
              czPhoto('almond-dragees-100gm-1', 'Almond Dragees 100gm'),
              czPhoto('50-percent-dark-chocolate-bar-100gm-2', '50% Dark Chocolate Bar 100gm'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-4', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('guava-tamarind-1', 'Guava Tamarind'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-220gm-2', 'Pistachio Kunafa Milk Chocolate Bar 220gm'),
              czPhoto('festive-box-of-4-2', 'Festive Box of 4'),
              czPhoto('raspberry-and-dark-chocolate-2', 'Raspberry & Dark Chocolate'),
              czPhoto('diwali-edition-2', 'Diwali Edition'),
              czPhoto('80-percent-dark-chocolate-bar-50gm-6', '80% Dark Chocolate Bar 50gm'),
              czPhoto('guava-tamarind-2', 'Guava Tamarind'),
              czPhoto('kunafa-eclat-1', 'Kunafa Eclat'),
              czPhoto('white-chocolate-pistachio-truffle-2', 'White Chocolate Pistachio (truffle)'),
              czPhoto('pistachio-kunafa-milk-chocolate-bar-220gm-3', 'Pistachio Kunafa Milk Chocolate Bar 220gm'),
              czPhoto('50-percent-dark-chocolate-pistachio-kunafa-bar-100gm-6', '50% Dark Chocolate Pistachio Kunafa Bar 100gm'),
              czPhoto('choco-hazelle-1', 'Choco Hazelle'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-4', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('signature-blue-box-of-12-2', 'Signature Blue Box of 12'),
              czPhoto('yuzu-mango-1', 'Yuzu Mango'),
              czPhoto('corporate-gifting-edition-2', 'Corporate Gifting Edition'),
              czPhoto('vanilla-and-passion-2', 'Vanilla & Passion'),
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
              czPhoto('nutty-fudge-1', 'Nutty Fudge'),
              czPhoto('white-chocolate-pistachio-slab-3', 'White Chocolate Pistachio Slab'),
              czPhoto('hazelnut-milk-chocolate-bar-100gm-3', 'Hazelnut Milk Chocolate Bar 100gm'),
              czPhoto('animals-5', 'Animals'),
              czPhoto('lemon-and-chilli-2', 'Lemon & Chilli'),
              czPhoto('50-percent-dark-chocolate-cashew-sea-salt-bar-100gm-5', '50% Dark Chocolate Cashew Sea Salt Bar 100gm'),
              czPhoto('white-chocolate-pistachio-slab-2', 'White Chocolate Pistachio Slab'),
              czPhoto('dates-and-cacao-nibs-sugar-free-bar-50gm-5', 'Dates & Cacao Nibs Sugar Free Bar 50gm'),
              czPhoto('amber-rabdi-4', 'Amber Rabdi'),
            ],
          },
        ],
      },
      { slug: 'terragreen', name: 'TerraGreen', listed: true, projects: [soon('terragreen-soon', 'sage')] },
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
