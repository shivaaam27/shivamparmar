/**
 * All the words and images on the landing page live here.
 * Edit this file to change content; the components only handle layout and motion.
 * (Everything marked lorem ipsum is a placeholder.)
 */

export const site = {
  name: 'Shivam',
  fullName: 'Shivam Parmar',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  email: 'lorem@ipsum.dolor',
};

export const nav = [
  { label: 'Home', href: '/#top' },
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/#work' },
  { label: 'Contact', href: '/#contact' },
];

export const hero = {
  /** Letters that jumble; the centre row resolves into this word. */
  word: 'SHIVAM',
  /** Small mono lines under the name (one or more). */
  descriptor: ['Since 1998'],
  footer: ['Pharmacist', 'Photographer', 'Claude Code & AI expert', 'Building systems'],
  /** Put a photo in /public and set e.g. '/hero.jpg'. Set to null for the Three.js light instead. */
  image: '/images/hero-signin.jpg' as string | null,
  /** Optional portrait crop used on phones (screens up to 720px wide). */
  imageMobile: '/images/hero-signin-portrait.jpg' as string | null,
  /** Which part of the photo stays in view when the screen crops it (CSS object-position). */
  imagePosition: '50% 50%',
  /** 'light' photo (bright, like the beach) keeps dark text; 'dark' photo switches text to white. */
  imageTone: 'dark' as 'light' | 'dark',
  /** Where the name sits on desktop: 'left' keeps it in open water beside the boat; 'center' is the Rowan layout. */
  align: 'center' as 'left' | 'center',
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
  headline: ['Hi, I’m Shivam.'],
  intro: [
    'I help brands design and build custom systems that work beautifully: functional at their core and considered in every detail.',
    'I believe the most lasting work pairs technical precision with emotional depth. It creates systems that resonate with the people they serve, from customers to teams and communities, and builds strong connections and long-term growth in business and in life.',
  ],
  disciplinesTag: 'What I do',
  disciplines: [
    {
      title: 'Systems',
      text: 'Custom systems built around how a brand actually works. They are functional first, easy to use, and designed to grow with the business.',
    },
    {
      title: 'AI & prompt engineering',
      text: 'I design AI workflows and integrate them into everyday work with tools like Claude Code, with prompts engineered for reliable results. Repetitive tasks get automated so people spend their time where it matters, saving hours every week.',
    },
    {
      title: 'Design',
      text: 'Posters, websites, social media posts and video. Every piece is designed to be clear, consistent and visually striking, from a single post to a full site.',
    },
    {
      title: 'Photography',
      text: 'Images with atmosphere and intent, from open water and quiet landscapes to people and places. Photography shapes how I see composition, light and detail in everything I make.',
    },
    {
      title: 'Pharmacy',
      text: 'I’m a pharmacist. The precision, care and responsibility of that work carry into every system I build.',
    },
  ],
  closing: {
    headline: ['Let’s build something', 'that lasts.'],
    link: { label: 'Get in touch', href: '/#contact' },
  },
};

export const work = {
  tag: 'Selected',
  title: 'Work',
  meta: [
    { label: 'Lorem', items: ['All', 'Lorem ipsum', 'Dolor sit', 'Amet', 'Consectetur'] },
    { label: 'Ipsum', items: ['Lorem', 'Ipsum dolor', 'Sit amet'] },
  ],
  /** image: '/work/01.jpg' replaces the tonal placeholder */
  items: [
    { title: 'Files Management', tone: 'ink', image: '/images/work-files-management.jpg', alt: 'Two people at a monitor showing the Files Management app' },
    { title: 'Task Management', tone: 'ink', image: '/images/work-task-management.jpg', alt: 'Someone looking at a studio display showing the Task Management app' },
    { title: 'Dashboard', tone: 'stone', image: '/images/work-dashboard.jpg', alt: 'Someone at a laptop surrounded by floating panels of the Task Management dashboard' },
    { title: 'Dashboard on iPad', tone: 'ink', image: '/images/work-dashboard-ipad.jpg', alt: 'A hand with a stylus over an iPad showing the Task Management dashboard' },
    { title: 'Adipiscing', tone: 'sand' },
    { title: 'Elit sed', tone: 'oxblood' },
    { title: 'Tempor', tone: 'sage' },
    { title: 'Incididunt', tone: 'taupe' },
    { title: 'Labore', tone: 'olive' },
    { title: 'Magna aliqua', tone: 'cyan' },
  ] as { title: string; tone: Tone; image?: string; alt?: string }[],
};

export const contact = {
  tag: 'Contact',
  headline: ['Lorem ipsum', 'dolor sit amet.'],
  columns: [
    { label: 'Lorem', links: [{ label: 'Ipsum', href: '#' }, { label: 'Dolor', href: '#' }, { label: 'Sit amet', href: '#' }] },
    { label: 'Ipsum', lines: ['Lorem ipsum dolor', 'Sit amet, 00000'] },
    { label: 'Dolor', lines: ['Lorem ipsum dolor sit amet, consectetur adipiscing.'] },
  ] as { label: string; links?: { label: string; href: string }[]; lines?: string[] }[],
  footerNote: 'Lorem ipsum dolor',
};
