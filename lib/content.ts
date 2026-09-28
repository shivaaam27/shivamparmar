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
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];

export const hero = {
  /** Letters that jumble; the centre row resolves into this word. */
  word: 'SHIVAM',
  descriptor: ['Lorem ipsum based', 'dolor sit amet'],
  footer: ['Lorem ipsum', 'Dolor', 'Sit amet', 'Consectetur'],
  /** Put a photo in /public and set e.g. '/hero.jpg'. Set to null for the Three.js light instead. */
  image: '/images/hero-boat.jpg' as string | null,
  /** Optional portrait crop used on phones (screens up to 720px wide). */
  imageMobile: '/images/hero-boat-portrait.jpg' as string | null,
  /** Which part of the photo stays in view when the screen crops it (CSS object-position). */
  imagePosition: '0% 50%',
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
  headline: ['Lorem ipsum', 'dolor sit amet,', 'consectetur elit'],
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua — ut enim ad minim veniam, quis nostrud exercitation.',
  sign: 'Lorem in Ipsum, 2026.',
  /** image: '/about-1.jpg' replaces the tonal placeholder */
  images: [
    { tone: 'cyan' as Tone, image: '/images/about-waves.jpg' as string | null, alt: 'Waves breaking over dark rocks' },
    { tone: 'sand' as Tone, image: '/images/about-beach.jpg' as string | null, alt: 'A lone figure walking across white sand, seen from above' },
  ],
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
    { title: 'Lorem ipsum', tone: 'ink' },
    { title: 'Dolor sit', tone: 'amber' },
    { title: 'Amet', tone: 'rose' },
    { title: 'Consectetur', tone: 'stone' },
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
