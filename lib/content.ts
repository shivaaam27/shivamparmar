/**
 * All the words and images on the landing page live here.
 * Edit this file to change content; the components only handle layout and motion.
 * (Everything marked lorem ipsum is a placeholder.)
 */

export const site = {
  name: 'Shivam',
  fullName: 'Shivam Parmar',
  description: 'Shivam Parmar is a pharmacist, photographer and systems builder in Dar es Salaam, Tanzania: custom business systems, AI workflows, photography and design.',
  jobTitle: 'Pharmacist, photographer and systems builder',
  /** Profiles that are also you: they tell search engines these all belong to one person. */
  sameAs: ['https://www.linkedin.com/in/shivaaam', 'https://www.instagram.com/ishivamparmar', 'https://orcid.org/0009-0007-7272-2394'],
  email: 'ishivamparmar@gmail.com',
  /** Both numbers take calls and WhatsApp. `tel` / `wa` are the same number in international form, without spaces. */
  phones: [
    { label: '+255 686 450 999', tel: '+255686450999', wa: '255686450999' },
    { label: '+255 795 334 455', tel: '+255795334455', wa: '255795334455' },
  ],
  location: 'Dar es Salaam, Tanzania',
};

export const nav = [
  { label: 'Home', href: '/#top' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/#contact' },
];

export const hero = {
  /** Letters that jumble; the centre row resolves into this word. */
  word: 'SHIVAM',
  footer: ['Pharmacist', 'Photographer', 'Claude Code & AI expert', 'Building systems'],
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
  headline: ['Hi, I’m Shivam,', 'pharmacist, photographer', 'and systems builder.'],
  body: 'I help brands design and build custom systems that work beautifully: functional at their core and considered in every detail. Alongside photography and design, from posters and websites to social posts and video, I build AI workflows that save hours of work. I pair technical precision with emotional depth, so what I make resonates with customers, teams and communities, and builds lasting growth.',
  link: { label: 'Read more about me', href: '/about' },
};

/** The full /about page. */
export const aboutPage = {
  tag: 'About',
  /** The sections, in order; they also make up the index on the left. */
  sections: [
    { id: 'intro', label: 'Intro' },
    { id: 'numbers', label: 'In numbers' },
    { id: 'services', label: 'What I do' },
    { id: 'clients', label: 'Worked with' },
    { id: 'experience', label: 'Experience' },
    { id: 'say-hello', label: 'Say hello' },
    { id: 'index', label: 'Index' },
  ],
  eyebrow: 'Pharmacist · Photographer · Systems builder',
  /** Plain facts, written the way people search and AI assistants quote. Also used in /llms.txt. */
  facts: [
    { label: 'Name', value: 'Shivam Parmar' },
    { label: 'Based in', value: 'Dar es Salaam, Tanzania' },
    { label: 'Profession', value: 'Pharmacist, photographer and systems builder' },
    { label: 'Education', value: 'BPharm (GITAM, India), MSc Pharmacovigilance & Pharmacoepidemiology (MUHAS)' },
    { label: 'Works on', value: 'Custom business systems, AI workflows with Claude Code, photography, graphic design' },
    { label: 'Languages', value: 'English, Kiswahili, Hindi, Gujarati' },
  ],
  headline: ['Hi, I’m Shivam.'],
  intro: [
    'I help brands design and build custom systems that work beautifully: functional at their core and considered in every detail.',
    'I believe the most lasting work pairs technical precision with emotional depth. It creates systems that resonate with the people they serve, from customers to teams and communities, and builds strong connections and long-term growth in business and in life.',
  ],
  disciplinesTag: 'What I do',
  disciplines: [
    {
      title: 'Systems',
      image: '/images/work-dashboard-ipad.jpg' as string | null,
      text: 'Custom systems built around how a brand actually works. They are functional first, easy to use, and designed to grow with the business.',
    },
    {
      title: 'AI & prompt engineering',
      image: '/images/about-ai.jpg' as string | null,
      text: 'I design AI workflows and integrate them into everyday work with tools like Claude Code, with prompts engineered for reliable results. Repetitive tasks get automated so people spend their time where it matters, saving hours every week.',
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
  clients: {
    title: ['Brands and people', 'I’ve worked with.'],
    /** Companies I've worked with (backgrounds removed, in /public/logos). */
    logos: [
      { name: 'CocoZuri Chocolat', src: '/logos/cocozuri.png' },
      { name: 'Dar Spice Centre', src: '/logos/dar-spice-centre.png' },
      { name: 'Mining Engineering Services', src: '/logos/mes.png' },
      { name: 'Oracle', src: '/logos/oracle.png' },
      { name: 'Pamoja+', src: '/logos/pamoja-plus.png' },
      { name: 'Pinnacle Engineering Solutions', src: '/logos/pinnacle-engineering.png' },
      { name: 'Rugantino', src: '/logos/rugantino.png' },
      { name: 'TerraGreen', src: '/logos/terragreen.png' },
      { name: 'V1 Supermarket', src: '/logos/v1-supermarket.png' },
    ] as { name: string; src: string | null }[],
  },
  /** The journey so far, newest first: a summary from the CV (the full story comes later). */
  experience: [
    { years: '2026', role: 'Systems & AI', place: 'Dar es Salaam', text: 'Built task and file management systems for a group of companies, with AI workflows made in Claude Code.' },
    { years: '2025 – 2026', role: 'MSc Pharmacovigilance & Pharmacoepidemiology', place: 'MUHAS', text: 'Drug safety, and how medicines behave across whole populations.' },
    { years: '2024 – 2025', role: 'Pharmacy intern', place: 'Jakaya Kikwete Cardiac Institute', text: 'Internship training at Tanzania’s national heart hospital.' },
    { years: '2024', role: 'Branch Manager', place: 'Mansoor Daya Chemicals', text: 'Ran a pharmacy branch: the team, the stock and the customers.' },
    { years: '2020 – 2024', role: 'Bachelor of Pharmacy', place: 'GITAM University, India', text: 'On a full Government of India scholarship. Founded the pharmacy students’ association, led the international students’ association and co-wrote seven papers.' },
    { years: '2019 – 2020', role: 'Pharmaceutical Technician', place: 'Regency Hospital', text: 'Dispensing and pharmacy care in a busy private hospital.' },
    { years: '2016 – 2019', role: 'Diploma in Pharmaceutical Sciences', place: 'Kilimanjaro School of Pharmacy', text: 'Where pharmacy began, alongside volunteering at St. Joseph Hospital and the Jaffery dispensary.' },
    { years: '2014', role: 'Graphic design', place: 'Moshi Institute of Technology', text: 'A certificate in graphics and design, and later teaching it: the start of the other half.' },
  ],

  hello: {
    title: ['Tell me about', 'your next project.'],
    text: 'A system, a shoot, a design, or an idea that needs shaping. Write, call or send a WhatsApp.',
  },
  ending: {
    greeting: 'Hallo, I’m Shivam.',
    line: 'I build systems, take photographs and design, from Dar es Salaam.',
    cta: 'Start a project',
  },
  closing: {
    headline: ['Let’s build something', 'that lasts.'],
    link: { label: 'Get in touch', href: '/#contact' },
  },
};

/** Heading for the Work section; the work itself lives in lib/work.ts. */
export const work = {
  tag: 'Selected',
  title: 'Work',
};

export const contact = {
  tag: 'Contact',
  headline: ['Got something', 'worth making?'],
  columns: [
    { label: 'Call', links: site.phones.map((p) => ({ label: p.label, href: `tel:${p.tel}` })) },
    { label: 'WhatsApp', links: site.phones.map((p) => ({ label: p.label, href: `https://wa.me/${p.wa}` })) },
    { label: 'Based in', lines: [site.location, 'Working with people anywhere'] },
  ] as { label: string; links?: { label: string; href: string }[]; lines?: string[] }[],
  /** Shown in the footer; the site counts visits anonymously with Umami (no cookies). */
  footerNote: 'No cookies · anonymous visit stats',
};
