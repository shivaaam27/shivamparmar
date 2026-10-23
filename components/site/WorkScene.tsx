'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { PACE, RISE, growClip, gsap, onTouch, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { ArrowUR } from './Art';
import Rich from './Rich';
import { copy } from '@/lib/copy';
import { srcSet, thumbOf } from '@/lib/thumb';

const PHOTO = { src: '/images/mikumi-elephants.jpg', alt: 'Elephants in the grass at Mikumi National Park, photographed by Shivam Parmar', slug: 'mikumi-national-park', title: 'Mikumi National Park' };
/** The wall of work, row by row (the middle row has the main photo in its centre). */
const TILES: { src: string; slug: string; title: string }[][] = [
  [
    { src: '/images/work-dashboard-ipad.jpg', slug: 'task-management', title: 'Task Management' },
    { src: '/images/websites/terragreen-poster.jpg', slug: 'terragreen-website', title: 'TerraGreen' },
    { src: '/images/cocozuri-pralines.jpg', slug: 'cocozuri', title: 'CocoZuri' },
    { src: '/images/delta-facade.jpg', slug: 'delta-hotel', title: 'Delta Hotels' },
    { src: '/images/cocozuri-social/strawberry-and-basil-2.jpg', slug: 'cocozuri-social', title: 'CocoZuri Social Media' },
  ],
  [
    { src: '/images/roros-boat-bar.jpg', slug: 'roros', title: 'Roro’s' },
    { src: '/images/sgr-platform.jpg', slug: 'sgr-train', title: 'SGR Train' },
  ],
  [
    { src: '/images/websites/cocozuri-poster.jpg', slug: 'cocozuri-website', title: 'CocoZuri Website' },
    { src: '/images/dar-kayak.jpg', slug: 'dar-es-salaam', title: 'Dar es Salaam' },
    { src: '/images/morogoro-aerial.jpg', slug: 'morogoro-hotel', title: 'Morogoro Hotel' },
    { src: '/images/websites/group-poster.jpg', slug: 'oracle-consultancy-group', title: 'Oracle Consultancy Group' },
    { src: '/images/moshi-fields.jpg', slug: 'moshi', title: 'Moshi' },
  ],
];

/**
 * The cream page after About. It starts right after About's last words: it rises from the bottom as a rounded card
 * with a margin each side and grows to the full screen over About, which stays where it is. It holds the wall of
 * work (three rows of pictures, the main photograph in the middle), a line about the work and a link to all of it,
 * then whatever follows on the same cream (the products). Nothing in it zooms or pins.
 * About's scene ends one screen early so this page's rise is the last screen of scrolling it owns.
 */
export default function V2WorkScene({ children }: { children?: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const card = el.querySelector('.v2-sheet__card');
    const about = document.querySelector('.v2-scene__about');
    // The page's own top reaches the top of the screen after RISE screens of scrolling, but the card is held back
    // so it climbs at about half the speed of the scroll: --g goes 0 → 1 (the rounded card grows to the full width)
    // while it rises, and About, still held, sinks back a little under it.
    // (on a touch screen the page follows the finger a little closer: the long trail made this rise bounce)
    const st = { trigger: el, start: () => `top ${RISE * 100}%`, end: 'top top', scrub: onTouch() ? .3 : PACE.scrub, invalidateOnRefresh: true };
    // the clip is written onto the card itself (growClip), never as a custom property: see lib/motion.ts
    const open = { g: 0 };
    const clip = card as HTMLElement;
    const paint = () => { clip.style.clipPath = growClip(open.g); };
    paint();
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: st })
      .fromTo(card, { y: () => -(RISE - 1) * window.innerHeight }, { y: 0 }, 0)
      .to(open, { g: 1, onUpdate: paint }, 0);
    // the rows drift slowly past each other while the wall is on screen (top and bottom one way, the middle the other)
    const drift = { trigger: el.querySelector('.v2-wa__grid'), start: 'top bottom', end: 'bottom top', scrub: PACE.scrub, invalidateOnRefresh: true };
    gsap.fromTo(el.querySelectorAll('.v2-wa__row--0, .v2-wa__row--2'), { xPercent: 1.5 }, { xPercent: -1.5, ease: 'none', scrollTrigger: drift });
    gsap.fromTo(el.querySelector('.v2-wa__row--1'), { xPercent: -1.5 }, { xPercent: 1.5, ease: 'none', scrollTrigger: drift });
    if (about) gsap.fromTo(about, { scale: 1, y: 0, opacity: 1 }, { scale: .9, y: -50, opacity: .25, ease: 'none', immediateRender: false, scrollTrigger: st });
  }, { scope: root });

  return (
    <div ref={root} className="v2-sheet" style={{ '--rise': RISE } as React.CSSProperties}>
      <div className="v2-sheet__card">
      <section className="v2-wa" id="work" aria-label="Selected work">
        <div className="v2-wa__grid">
          <h2 className="v2-wa__head">{copy('work.title', 'Work')}</h2>
          {TILES.map((row, r) => (
            <div key={r} className={`v2-wa__row v2-wa__row--${r}`}>
              {row.map((t, i) => (
                <Fragment key={t.src}>
                  {r === 1 && i === 1 && (
                    <Link href={`/work/${PHOTO.slug}`} className="v2-wa__tile v2-wa__tile--main" aria-label="Mikumi National Park photographs">
                      {/* the phone-sized copy on a phone (the original is 1600 × 2000, ~13 MB once decoded) */}
                      <img src={thumbOf(PHOTO.src, 1600)} srcSet={srcSet(PHOTO.src, 1600)} sizes="(max-width: 720px) 80vw, 42vw" alt={PHOTO.alt} width={1600} height={2000} decoding="async" loading="lazy" />
                      <span className="v2-wa__cap" aria-hidden="true">{PHOTO.title}</span>
                    </Link>
                  )}
                  <Link href={`/work/${t.slug}`} className="v2-wa__tile" tabIndex={-1} aria-hidden="true"><img src={thumbOf(t.src, 2000)} alt="" loading="lazy" decoding="async" /><span className="v2-wa__cap">{t.title}</span></Link>
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="v2-wa__body">
          <p className="v2-wa__lead"><Rich text={copy('work.paragraph')} /></p>
          <Link className="v2-btn" href={'/work'}>See all work<span className="v2-btn__dot"><ArrowUR /></span></Link>
        </div>
      </section>
      {children}
      </div>
    </div>
  );
}
