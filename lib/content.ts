/**
 * All the words and images on the landing page live here.
 * Edit this file to change content; the components only handle layout and motion.
 * (Everything marked lorem ipsum is a placeholder.)
 */

import { copy, copyLines, plain } from './copy';

export const site = {
  name: 'Shivo Labs',
  fullName: 'Shivo Labs',
  tagline: 'Software and digital solutions',
  description: 'Shivo Labs is the freelance software and digital solutions business of Shivam Parmar in Dar es Salaam, Tanzania: websites, iPhone, Android and Windows apps, custom business systems, AI workflows and MCP integrations, branding and social media.',
  /** The person behind the company. */
  founder: { name: 'Shivam Parmar', jobTitle: 'Founder of Shivo Labs; pharmacist, photographer and systems builder' },
  jobTitle: 'Pharmacist, photographer and systems builder',
  /** Profiles that are also you: they tell search engines these all belong to one person. */
  sameAs: ['https://www.linkedin.com/in/shivaaam', 'https://www.instagram.com/ishivamparmar', 'https://orcid.org/0009-0007-7272-2394'],
  email: 'shivam@shivolabs.com',
  /** Takes calls and WhatsApp. `tel` / `wa` are the same number in international form, without spaces. */
  phones: [
    { label: '+255 795 334 455', tel: '+255795334455', wa: '255795334455' },
  ],
  location: 'Dar es Salaam, Tanzania',
};

export const nav = [
  { label: 'Home', href: '/#top' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Journal', href: '/journal' },
  { label: 'Contact', href: '/#contact' },
];

export const hero = {
  /** Letters that jumble; the centre row resolves into this word. */
  word: 'SHIVAM',
  footer: copyLines('home.hero.services', ['Websites & apps', 'Custom systems', 'AI & MCP', 'Branding & content']),
  /** Put a photo in /public and set e.g. '/hero.jpg'. Set to null for the Three.js light instead. */
  image: null as string | null,
  /** Optional portrait crop used on phones (screens up to 720px wide). */
  imageMobile: '/images/hero-dashboard-portrait.jpg' as string | null,
  /** Which part of the photo stays in view when the screen crops it (CSS object-position). */
  imagePosition: '50% 50%',
  /** 'light' photo (bright, like the beach) keeps dark text; 'dark' photo switches text to white. */
  imageTone: 'dark' as 'light' | 'dark',
  /** Where the name sits on desktop: 'left' keeps it in open water beside the boat; 'center' is the Rowan layout. */
  align: 'center' as 'left' | 'center',
  /** With no photo: the avatar light behind the name. Awake (eyes follow the pointer) from `wake` to `sleep` o'clock, asleep otherwise. */
  avatar: { timeZone: 'Africa/Dar_es_Salaam', wake: 8, sleep: 21 },
  /** Replay the intro when scrolling back to the top. */
  replayOnReturn: false,
};

export type Tone =
  | 'amber' | 'oxblood' | 'ink' | 'rose' | 'stone'
  | 'sand' | 'sage' | 'taupe' | 'olive' | 'cyan';

export const about = {
  tag: 'About',
  headline: copyLines('home.about.headline', ['Freelance digital solutions,', 'from Dar es Salaam.']),
  /** Part of the headline whose letters jumble, then land (like the hero). */
  scramble: copy('home.about.highlight', 'digital solutions'),
  body: plain(copy('home.about.body')),
  /** The same, with the [[highlighted words]] marked. */
  bodyRich: copy('home.about.body'),
  /** Small print under the description (for the asterisk). */
  note: copy('home.about.note', '*Not limited to those listed.'),
  link: { label: copy('home.about.link', 'Read more about me'), href: '/about' },
};

/** The full /about page. */
export const aboutPage = {
  tag: 'About',
  /** The sections, in order; they also make up the index on the left. */
  sections: [
    { id: 'intro', label: 'Intro' },
    { id: 'numbers', label: 'At a glance' },
    { id: 'services', label: 'What I do' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'clients', label: 'Worked with' },
    { id: 'experience', label: 'Experience' },
    { id: 'say-hello', label: 'Contact' },
    { id: 'index', label: 'Index' },
  ],
  eyebrow: 'Freelance software & digital solutions · Pharmacist · Photographer',
  /** Plain facts, written the way people search and AI assistants quote. Also used in /llms.txt. */
  facts: [
    { label: 'Name', value: 'Shivam Parmar' },
    { label: 'Runs', value: 'Shivo Labs, a freelance software and digital solutions business in Dar es Salaam' },
    { label: 'Based in', value: 'Dar es Salaam, Tanzania' },
    { label: 'Profession', value: 'Pharmacist, photographer and systems builder' },
    { label: 'Education', value: 'BPharm (GITAM, India), MSc Pharmacovigilance & Pharmacoepidemiology (MUHAS)' },
    { label: 'Works on', value: 'Websites, iPhone, Android and Windows apps, custom business systems, AI workflows and MCP servers, photography, graphic design' },
    { label: 'Languages', value: 'English, Kiswahili, Hindi, Gujarati' },
  ],
  headline: ['Hi, I’m Shivam.'],
  intro: copy('about.intro').split(/\n\s*\n/).map(plain),
  /** The same two, with the [[highlighted words]] marked. */
  introRich: copy('about.intro').split(/\n\s*\n/),
  disciplinesTag: 'What I do',
  disciplines: [
    {
      title: 'Systems & apps',
      image: '/images/work-dashboard-ipad.jpg' as string | null,
      text: 'Custom systems and apps built around how a business actually works, on the web, iPhone, Android and Windows. They are functional first, easy to use, and designed to grow with the business.',
    },
    {
      title: 'AI & prompt engineering',
      image: '/images/about-ai.jpg' as string | null,
      text: 'I design AI workflows and build them into everyday work with tools like Claude Code, including AI agents and MCP servers that let an assistant work with a business’s own systems. Repetitive tasks get automated so people spend their time where it matters, saving hours every week.',
    },
    {
      title: 'Design',
      image: '/images/about-design.jpg' as string | null,
      text: 'Posters, websites, social media posts and video. Every piece is designed to be clear, consistent and visually striking, from a single post to a full site.',
    },
    {
      title: 'Photography',
      image: '/images/mikumi-elephants.jpg' as string | null,
      text: 'Images with atmosphere and intent, from open water and quiet landscapes to people and places. Photography shapes how I see composition, light and detail in everything I make.',
    },
    {
      title: 'Pharmacy',
      image: '/images/about-pharmacy.jpg' as string | null,
      text: 'I’m a pharmacist. The precision, care and responsibility of that work carry into every system I build.',
    },
  ],
  /** Highlights from the CV: things I've built, in plain words (no employer named). */
  highlights: {
    title: copyLines('about.shipped.title', ['Things I’ve built', 'and shipped.']),
    items: Array.from({ length: 8 }, (_, k) => ({ title: copy(`about.shipped.${k + 1}.title`), text: copy(`about.shipped.${k + 1}.text`) })),
  },
  clients: {
    title: ['Brands, projects and people', 'I’ve worked with.'],
    /** Companies I've worked with (backgrounds removed, in /public/logos). */
    logos: [
      { name: 'Oracle Consultancy Group', src: '/logos/oracle.png' },
      { name: 'TerraGreen', src: '/logos/terragreen.png' },
      { name: 'Delta Hotels by Marriott Dar es Salaam', src: '/logos/delta-hotels.png' },
      { name: 'CocoZuri Chocolat', src: '/logos/cocozuri.png' },
      { name: 'Dar Spice Centre', src: '/logos/dar-spice-centre.png' },
      { name: 'RORO’s Beach Bar', src: '/logos/roros.png' },
      { name: 'Dar Distributors', src: '/logos/dar-distributors.png' },
      { name: 'The Beachcomber Hotel & Resort', src: '/logos/beachcomber.png' },
      { name: 'V1 Supermarket', src: '/logos/v1-supermarket.png' },
      { name: 'Rugantino', src: '/logos/rugantino.png' },
      { name: 'Akasaki FZCO', src: '/logos/akasaki.png' },
      { name: 'Mining Engineering Services', src: '/logos/mes.png' },
      { name: 'Tanam Advisory', src: '/logos/tanam-advisory.png' },
      { name: 'Pinnacle Engineering Solutions', src: '/logos/pinnacle-engineering.png' },
    ] as { name: string; src: string | null }[],
  },
  /** The journey so far, newest first: a summary from the CV. `group` puts each role under Work or Education. */
  experience: [
    { group: 'Work', years: '2026', role: 'Shivo Labs', place: 'Dar es Salaam', text: 'Freelance software and digital solutions: websites, apps for iPhone, Android, Windows and TV, and AI tools, built and shipped from Dar es Salaam.' },
    { group: 'Work', years: '2026', role: 'Systems & AI', place: 'Dar es Salaam', text: 'In five months, went from spreadsheets to building a group of companies’ task management platform, an AI document agent and a compliance alert engine, with AI workflows made in Claude Code.' },
    { group: 'Education', years: '2025 – 2026', role: 'MSc Pharmacovigilance & Pharmacoepidemiology', place: 'MUHAS', text: 'Drug safety, and how medicines behave across whole populations.' },
    { group: 'Work', years: '2024 – 2025', role: 'Pharmacy intern', place: 'Jakaya Kikwete Cardiac Institute', text: 'Internship training at Tanzania’s national heart hospital.' },
    { group: 'Work', years: '2024', role: 'Branch Manager', place: 'Mansoor Daya Chemicals', text: 'Ran a pharmacy branch: the team, the stock and the customers.' },
    { group: 'Education', years: '2020 – 2024', role: 'Bachelor of Pharmacy', place: 'GITAM University, India', text: 'On a full Government of India scholarship. Founded the pharmacy students’ association, led the international students’ association and co-wrote seven papers.' },
    { group: 'Work', years: '2019 – 2020', role: 'Pharmaceutical Technician', place: 'Regency Hospital', text: 'Dispensing and pharmacy care in a busy private hospital.' },
    { group: 'Education', years: '2016 – 2019', role: 'Diploma in Pharmaceutical Sciences', place: 'Kilimanjaro School of Pharmacy', text: 'Where pharmacy began, alongside volunteering at St. Joseph Hospital and the Jaffery dispensary.' },
    { group: 'Education', years: '2014', role: 'Graphic design', place: 'Moshi Institute of Technology', text: 'A certificate in graphics and design, and later teaching it: the start of the other half.' },
  ],

  hello: {
    title: ['Tell me about', 'your next project.'],
    text: 'A system, a shoot, a design, or an idea that needs shaping. Write, call or send a WhatsApp.',
  },
  ending: {
    greeting: 'Hallo, I’m Shivam.',
    line: 'Through Shivo Labs I build systems, apps, websites and brands, from Dar es Salaam.',
    cta: 'Start a project',
    /** The photo across the top of the index. */
    photo: '/images/dar-kayak.jpg',
  },
  closing: {
    headline: ['Let’s build something', 'that lasts.'],
    link: { label: 'Get in touch', href: '/#contact' },
  },
};

/** The logo strip on the home page, between Work and Contact. */
export const clients = {
  tag: 'Worked with',
  /** Same title as the About page. */
  title: ['Brands, projects and people', 'I’ve worked with.'],
  logos: [
    { name: 'Oracle Consultancy Group', src: '/logos/oracle.png' },
    { name: 'TerraGreen', src: '/logos/terragreen.png' },
    { name: 'Delta Hotels by Marriott Dar es Salaam', src: '/logos/delta-hotels.png' },
    { name: 'CocoZuri Chocolat', src: '/logos/cocozuri.png' },
    { name: 'Dar Spice Centre', src: '/logos/dar-spice-centre.png' },
    { name: 'RORO’s Beach Bar', src: '/logos/roros.png' },
    { name: 'Dar Distributors', src: '/logos/dar-distributors.png' },
    { name: 'The Beachcomber Hotel & Resort', src: '/logos/beachcomber.png' },
    { name: 'V1 Supermarket', src: '/logos/v1-supermarket.png' },
    { name: 'Rugantino', src: '/logos/rugantino.png' },
    { name: 'Akasaki FZCO', src: '/logos/akasaki.png' },
    { name: 'Mining Engineering Services', src: '/logos/mes.png' },
    { name: 'Tanam Advisory', src: '/logos/tanam-advisory.png' },
    { name: 'Pinnacle Engineering Solutions', src: '/logos/pinnacle-engineering.png' },
  ],
};

/** Heading for the Work section; the work itself lives in lib/work.ts. */
export const work = {
  tag: 'Selected',
  title: 'Work',
};

export const contact = {
  tag: 'Contact',
  headline: copyLines('contact.headline', ['Got something', 'worth making?']),
  columns: [
    { label: 'Call', links: site.phones.map((p) => ({ label: p.label, href: `tel:${p.tel}` })) },
    { label: 'WhatsApp', links: site.phones.map((p) => ({ label: p.label, href: `https://wa.me/${p.wa}` })) },
    { label: 'Based in', lines: [site.location, 'Working with people anywhere'] },
  ] as { label: string; links?: { label: string; href: string }[]; lines?: string[] }[],
  /** Shown in the footer; the site counts visits anonymously with Umami (no cookies). */
  footerNote: copy('footer.note', 'No cookies · anonymous visit stats'),
};
