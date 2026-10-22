'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { pagedProjects, visibleCategories } from '@/lib/work';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { tc, v2 } from '@/lib/v2';
import { ArrowUR } from './Art';

const PHOTO = { src: '/images/mikumi-elephants.jpg', alt: 'Elephants in the grass at Mikumi National Park, photographed by Shivam Parmar', slug: 'mikumi-national-park' };
/** The pictures around the main one once it pulls back, row by row (the middle row has the main photo in its centre). */
const TILES: { src: string; slug: string }[][] = [
  [
    { src: '/images/work-dashboard-ipad.jpg', slug: 'task-management' },
    { src: '/images/websites/terragreen-poster.jpg', slug: 'terragreen-website' },
    { src: '/images/cocozuri-pralines.jpg', slug: 'cocozuri' },
    { src: '/images/delta-facade.jpg', slug: 'delta-hotel' },
    { src: '/images/shivo-labs/home.jpg', slug: 'shivo-labs' },
  ],
  [
    { src: '/images/roros-boat-bar.jpg', slug: 'roros' },
    { src: '/images/sgr-platform.jpg', slug: 'sgr-train' },
  ],
  [
    { src: '/images/websites/cocozuri-poster.jpg', slug: 'cocozuri-website' },
    { src: '/images/dar-kayak.jpg', slug: 'dar-es-salaam' },
    { src: '/images/morogoro-aerial.jpg', slug: 'morogoro-hotel' },
    { src: '/images/websites/v1-poster.jpg', slug: 'v1-supermarket-website' },
    { src: '/images/moshi-fields.jpg', slug: 'moshi' },
  ],
];
const projects = pagedProjects();
const pictures = projects.reduce((n, p) => n + (p.project.images?.length ?? 0), 0);
const cats = visibleCategories().map((c) => {
  const ps = c.subcategories.flatMap((s) => s.projects);
  return { slug: c.slug, name: c.name, titles: ps.map((p) => p.title) };
});

/**
 * Selected work, the way Apple opens a feature: the photograph rises over About, then everything after it is on the
 * cream paper, which the Hub & Products panel then grows out of,
 * 1. the photograph itself rises over the end of About as the next layer; once it fills the screen the headline
 *    rises over it;
 * 2. scrolling, the headline fades and the photograph pulls back into the middle of a grid of work, the other
 *    pictures filling in around it in rows and columns that drift past each other;
 * 3. then, on the paper, a centred paragraph whose key words are in black, and below it two columns:
 *    big figures on the left, every kind of work with its projects on the right, each opened by a fine rule.
 * The section starts one screen early, so the photograph slides up over the last screen of the About scene.
 */
export default function V2WorkScene() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) { el.classList.add('is-still'); return; }
    const q = gsap.utils.selector(el);
    const pin = q('.v2-wa__pin')[0] as HTMLElement;
    // the main photo's place in the grid, as a clip of the full-screen frame
    const slotClip = () => {
      const st = (q('.v2-wa__stick')[0] as HTMLElement).getBoundingClientRect(), r = (q('.v2-wa__slot')[0] as HTMLElement).getBoundingClientRect();
      const pc = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
      return `inset(${pc(r.top - st.top, st.height)} ${pc(st.right - r.right, st.width)} ${pc(st.bottom - r.bottom, st.height)} ${pc(r.left - st.left, st.width)} round 20px)`;
    };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // starts once the screen is held, so nothing slides: the picture opens in place
      scrollTrigger: { trigger: pin, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    });
    // the picture itself is the layer that rises over the end of About (the section starts one screen early);
    // once it fills the screen, the headline rises over it and it holds
    gsap.set(q('.v2-wa__over > *'), { autoAlpha: 0, y: 40 });
    tl.to(q('.v2-wa__over > *'), { autoAlpha: 1, y: 0, duration: .8, stagger: .15, ease: 'power3.out' })
      .fromTo(q('.v2-wa__frame img'), { scale: 1.12 }, { scale: 1.06, duration: 1.4, ease: 'power1.out' }, 0)
      .to({}, { duration: .7 })
      // 2. the headline fades up; the photograph pulls back into a framed picture
      .to(q('.v2-wa__over'), { autoAlpha: 0, y: -50, duration: .9, ease: 'power1.in' })
      .to(q('.v2-wa__frame'), { clipPath: () => slotClip(), duration: 2, ease: 'power2.inOut' }, '<.2')
      .fromTo(q('.v2-wa__tile'), { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: 1.4, stagger: { each: .06, from: 'center' }, ease: 'power3.out' }, '<.7')
      // the rows drift past each other: top and bottom one way, the middle the other
      .fromTo(q('.v2-wa__row--0, .v2-wa__row--2'), { xPercent: 0 }, { xPercent: -6, duration: 3 }, '<')
      .fromTo(q('.v2-wa__row--1 .v2-wa__tile'), { x: 0 }, { x: (i) => (i ? 40 : -40), duration: 3 }, '<')
      .to(q('.v2-wa__frame img'), { scale: 1, duration: 2.2, ease: 'power2.inOut' }, '<')
      .fromTo(q('.v2-wa__shade'), { opacity: 1 }, { opacity: 0, duration: 1 }, '<')
      .fromTo(q('.v2-wa__tag'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .6 }, '>-.4')
      .to({}, { duration: .5 });

    // 3. the paragraph and the columns rise in as they arrive
    (q('.v2-wa__rise') as HTMLElement[]).forEach((item) => {
      gsap.fromTo(item, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%' } });
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: root });

  return (
    <section ref={root} className="v2-wa" id="work" aria-label="Selected work">
      <div className="v2-wa__pin">
        <div className="v2-wa__stick">
          <Link href={v2(`/work/${PHOTO.slug}`)} className="v2-wa__frame" aria-label="Mikumi National Park photographs">
            <img src={PHOTO.src} alt={PHOTO.alt} />
            <span className="v2-wa__shade" aria-hidden="true" />
          </Link>
          <div className="v2-wa__over">
            <h2 className="v2-wa__head">Selected <em>Work</em></h2>
          </div>
          <div className="v2-wa__grid" aria-hidden="true">
            {TILES.map((row, r) => (
              <div key={r} className={`v2-wa__row v2-wa__row--${r}`}>
                {row.map((t, i) => (
                  <Fragment key={t.src}>
                    {r === 1 && i === 1 && <span key="slot" className="v2-wa__slot" />}
                    <Link href={v2(`/work/${t.slug}`)} className="v2-wa__tile" tabIndex={-1}><img src={t.src} alt="" loading="lazy" /></Link>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
          <p className="v2-wa__tag">Mikumi National Park · Photography</p>
        </div>
      </div>

      <div className="v2-wa__body">
        <p className="v2-wa__lead v2-wa__rise">
          Work for <b>companies, hotels and brands across Tanzania</b>: <b>a task management system</b> for a group of companies,
          {' '}<b>websites</b> for TerraGreen, CocoZuri, V1 Supermarket and Oracle Consultancy Group, <b>photography</b> from Mikumi
          {' '}to the SGR train, and <b>social media</b> for Dar Distributors and CocoZuri.
        </p>

        <div className="v2-wa__cols">
          <ul className="v2-wa__stats">
            <li className="v2-wa__rise"><span>On this site</span><b>{projects.length}</b><span>projects</span></li>
            <li className="v2-wa__rise"><span>Over</span><b>{Math.floor(pictures / 10) * 10}</b><span>pictures and videos</span></li>
          </ul>
          <ul className="v2-wa__cats">
            {cats.map((c) => (
              <li key={c.slug} className="v2-wa__rise">
                <Link href={v2(`/work/${c.slug}`)} onClick={() => track(`Open work · ${c.name}`)}>
                  <b>{tc(c.name)} <ArrowUR /></b>
                  <span>{c.titles.join(', ')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="v2-wa__all v2-wa__rise">
          <Link className="v2-btn v2-btn--lime" href={v2('/work')}>See all work<span className="v2-btn__dot"><ArrowUR /></span></Link>
        </p>
      </div>
    </section>
  );
}
