'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { PACE, RISE, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion';
import { ArrowUR } from './Art';

const PHOTO = { src: '/images/mikumi-elephants.jpg', alt: 'Elephants in the grass at Mikumi National Park, photographed by Shivam Parmar', slug: 'mikumi-national-park' };
/** The wall of work, row by row (the middle row has the main photo in its centre). */
const TILES: { src: string; slug: string }[][] = [
  [
    { src: '/images/work-dashboard-ipad.jpg', slug: 'task-management' },
    { src: '/images/websites/terragreen-poster.jpg', slug: 'terragreen-website' },
    { src: '/images/cocozuri-pralines.jpg', slug: 'cocozuri' },
    { src: '/images/delta-facade.jpg', slug: 'delta-hotel' },
    { src: '/images/cocozuri-social/strawberry-and-basil-2.jpg', slug: 'cocozuri-social' },
  ],
  [
    { src: '/images/roros-boat-bar.jpg', slug: 'roros' },
    { src: '/images/sgr-platform.jpg', slug: 'sgr-train' },
  ],
  [
    { src: '/images/websites/cocozuri-poster.jpg', slug: 'cocozuri-website' },
    { src: '/images/dar-kayak.jpg', slug: 'dar-es-salaam' },
    { src: '/images/morogoro-aerial.jpg', slug: 'morogoro-hotel' },
    { src: '/images/websites/group-poster.jpg', slug: 'oracle-consultancy-group' },
    { src: '/images/moshi-fields.jpg', slug: 'moshi' },
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
    const st = { trigger: el, start: () => `top ${RISE * 100}%`, end: 'top top', scrub: PACE.scrub, invalidateOnRefresh: true };
    gsap.fromTo(card, { '--g': 0, y: () => -(RISE - 1) * window.innerHeight }, { '--g': 1, y: 0, ease: 'none', scrollTrigger: st });
    const tiles = gsap.utils.toArray<HTMLElement>('.v2-wa__tile', el);
    gsap.fromTo(tiles, { opacity: 0, y: 36, scale: .94 }, { opacity: 1, y: 0, scale: 1, ease: 'power2.out', stagger: { each: .05, from: 'center' }, immediateRender: false,
      scrollTrigger: { trigger: el, start: () => `top ${RISE * 100 - 40}%`, end: () => `top ${RISE * 40}%`, scrub: PACE.scrub, invalidateOnRefresh: true } });
    if (about) gsap.fromTo(about, { scale: 1, y: 0, opacity: 1 }, { scale: .9, y: -50, opacity: .25, ease: 'none', immediateRender: false, scrollTrigger: st });
  }, { scope: root });

  return (
    <div ref={root} className="v2-sheet" style={{ '--rise': RISE } as React.CSSProperties}>
      <div className="v2-sheet__card">
      <section className="v2-wa" id="work" aria-label="Selected work">
        <div className="v2-wa__grid">
          <h2 className="v2-wa__head">My <em>Work</em></h2>
          {TILES.map((row, r) => (
            <div key={r} className={`v2-wa__row v2-wa__row--${r}`}>
              {row.map((t, i) => (
                <Fragment key={t.src}>
                  {r === 1 && i === 1 && (
                    <Link href={`/work/${PHOTO.slug}`} className="v2-wa__tile v2-wa__tile--main" aria-label="Mikumi National Park photographs">
                      <img src={PHOTO.src} alt={PHOTO.alt} />
                    </Link>
                  )}
                  <Link href={`/work/${t.slug}`} className="v2-wa__tile" tabIndex={-1} aria-hidden="true"><img src={t.src} alt="" loading="lazy" /></Link>
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="v2-wa__body">
          <p className="v2-wa__lead">
            Working Across <b>Companies, Hotels And Brands Across Tanzania</b>, Building <b>Client-Tailored Software,
            {' '}Applications, Websites</b>, And More, But Not Limited To These. <b>More Than 20 Projects Completed</b>, And More Ongoing.
          </p>
          <Link className="v2-btn" href={'/work'}>See all work<span className="v2-btn__dot"><ArrowUR /></span></Link>
        </div>
      </section>
      {children}
      </div>
    </div>
  );
}
