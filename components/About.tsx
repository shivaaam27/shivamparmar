'use client';

import { Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { blobGrow } from '@/lib/blobTransit';
import { about } from '@/lib/content';
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger, rand } from '@/lib/motion';
import { track } from '@/lib/track';
import { awakeNow } from './HeroAvatar';

/** Phrases that get the highlighter stroke as the description fills in. */
const KEY_PHRASES = ['websites and apps', 'custom software', 'AI workflows'];
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Scroll-told intro: the section pins, "A digital solutions company in Tanzania" rises in (its first words jumbling until they land), then the
 * rest of the headline, then the description fills word by word from grey
 * to ink as you keep scrolling, and the link arrives last (with Blobby beside it).
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const words = about.body.split(' ');
  // which phrase (if any) each word belongs to
  const phraseOf = words.map(() => -1);
  KEY_PHRASES.forEach((ph, k) => {
    const pw = ph.split(' ').map(bare);
    for (let i = 0; i + pw.length <= words.length; i++) {
      if (pw.every((w, j) => bare(words[i + j]) === w)) { pw.forEach((_, j) => { phraseOf[i + j] = k; }); break; }
    }
  });

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const [first, ...rest] = q('.about__line');
    const bodyWords = q('.about__word');
    const body = q('.about__text .lead');
    const link = q('.about__sign');

    if (prefersReducedMotion()) {
      gsap.set([first, ...rest, body, bodyWords, link], { opacity: 1 });
      gsap.set(q('.about__word[data-hl]'), { backgroundSize: '100% 42%' });
      return;
    }

    // on the home page the intro screen stays put underneath (sticky hero): this section starts
    // over it, so its timeline begins at the very top and the first line rises as the light sets
    const overHero = !!document.querySelector('.hero:has(.avatar)');

    if (!overHero) {
      // first line rises in as the section scrolls into view
      gsap.fromTo(first, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 20%', scrub: true },
      });
    }

    let readSent = false;
    // then the section holds while the rest plays out with the scroll
    const tall = () => (root.current?.offsetHeight ?? 0) > window.innerHeight;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: () => (tall() ? 'bottom bottom' : 'top top'),
        end: () => `+=${window.innerHeight * (overHero ? 3.6 : 2.2)}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        // counts once per visit: someone scrolled the whole intro through
        onLeave: () => { if (!readSent) { readSent = true; track('Read about to the end'); } },
      },
    });
    if (overHero) {
      // the headline eases up a short way into place as the hero's logo settles, then the second line follows
      tl.to({}, { duration: 0.5 })
        .fromTo(first, { y: 36, scale: 0.97 }, { y: 0, scale: 1, duration: 1.8, ease: 'power2.out' }, 'rise')
        .fromTo(first, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.inOut' }, 'rise');
    }
    // "digital solutions": every letter is random until it lands, left to right, as the line rises
    const scr = q('.about__scr')[0] as HTMLElement | undefined;
    if (scr) {
      const final = scr.dataset.text ?? '';
      const letters = final.replace(/\s/g, '').toUpperCase();
      // letters change a few times a second, not every frame, so the jumble reads as a roll rather than a flicker
      let lastAt = 0, lastSettled = -1;
      const draw = (p: number, force = false) => {
        const settled = Math.floor(p * final.length);
        const now = performance.now();
        if (!force && settled === lastSettled && now - lastAt < 110) return;
        lastAt = now; lastSettled = settled;
        let out = '';
        for (let i = 0; i < final.length; i++) out += i < settled || final[i] === ' ' ? final[i] : rand(letters);
        scr.textContent = out;
      };
      const measure = () => { scr.style.width = ''; scr.textContent = final; scr.style.width = `${scr.getBoundingClientRect().width / Number(gsap.getProperty(first, 'scale') || 1)}px`; };
      measure();
      ScrollTrigger.addEventListener('refreshInit', () => { scr.style.width = ''; scr.textContent = final; });
      ScrollTrigger.addEventListener('refresh', measure);
      const prog = { p: 0 };
      draw(0, true);
      tl.to(prog, { p: 1, duration: 2.4, ease: 'none', onUpdate: () => draw(prog.p, prog.p >= 1), onReverseComplete: () => draw(0, true) }, overHero ? 'rise+=0.3' : 0);
    }
    const STEP = 0.11; // how fast the description fills, word by word (room for Blobby to rest between phrases)
    // the second line follows right behind the first: a short, soft rise, not a long climb
    tl.fromTo(rest, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.3, ease: 'power2.out' }, overHero ? 'rise+=1.1' : undefined)
      // the description arrives in full, in grey, as the headline finishes…
      .fromTo(body, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      // …then fills to ink word by word
      .addLabel('fill', '+=0.1')
      .fromTo(bodyWords, { opacity: 0.22 }, { opacity: 1, duration: 0.3, stagger: STEP, ease: 'none' }, 'fill')
      .fromTo(link, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
      .addLabel('linked')
      .to({}, { duration: 0.6 }); // a short beat of stillness before the pin releases

    const hlWords = q('.about__word[data-hl]');
    const F = tl.labels.fill;   // when the word-by-word fill starts, in timeline seconds
    const wipe = (w: HTMLElement, at: number, d = 0.22) =>
      tl.fromTo(w, { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', duration: d, ease: 'none' }, at);
    // the key phrases get their highlighter stroke as the fill reaches them (scroll-linked, so it reverses)
    hlWords.forEach((w) => wipe(w, F + bodyWords.indexOf(w) * STEP + 0.05));

    // ---- Blobby stays out of the description. It only appears when "Read more about me" arrives:
    // the hero's light pops up beside the link, and the home page's travelling Blobby carries on from there.
    const orb = root.current?.querySelector<HTMLElement>('.about__orb');
    if (!overHero || !orb || !root.current) return;
    orb.classList.toggle('is-asleep', !awakeNow());
    const face = orb.querySelector('.about__orb-face');
    const R = () => root.current!.getBoundingClientRect();
    const size = () => orb.offsetWidth;
    const linkSpot = () => {
      const r = R(), l = link[0].getBoundingClientRect();
      const dy = Number(gsap.getProperty(link[0], 'y'));
      return { x: l.left - r.left - size() * 1.1, y: l.top - dy - r.top + l.height / 2 };
    };
    gsap.set(orb, { opacity: 0, scale: 0.4 });
    gsap.set(face, { xPercent: 16 });

    // the moment in the scroll where the link has arrived
    const mark = tl.labels.linked - 0.6;
    let shown = false;
    const show = () => {
      shown = true;
      const { x, y } = linkSpot();
      gsap.killTweensOf(orb);
      gsap.set(orb, { x, y });
      gsap.to(orb, { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2.2)' });
    };
    const hide = () => {
      shown = false;
      gsap.killTweensOf(orb);
      gsap.to(orb, { opacity: 0, scale: 0.4, duration: 0.22, ease: 'power1.in' });
    };
    let refreshing = false;
    const onInit = () => { refreshing = true; };
    const onDone = () => {
      refreshing = false;
      if (shown) gsap.set(orb, { x: linkSpot().x, y: linkSpot().y });   // the page re-measured: stay beside the link
    };
    ScrollTrigger.addEventListener('refreshInit', onInit);
    ScrollTrigger.addEventListener('refresh', onDone);
    tl.eventCallback('onUpdate', () => {
      if (refreshing) return;   // the page re-measuring itself isn't the reader moving
      const t = tl.time();
      if (!shown && t >= mark) show();
      // going back only counts once clearly before the mark, so tiny wobbles in the scroll don't flip it
      else if (shown && t < mark - 0.15) hide();
    });
    // ---- stage 4: by "Read more about me" it reacts to the link (only when it's actually there)
    const linkEl = link[0] as HTMLElement;
    const bodyEl = orb.querySelector<HTMLElement>('.about__orb-body');
    let hopLoop: gsap.core.Timeline | null = null;
    const atLink = () => shown;
    const enter = () => {
      if (!atLink() || hopLoop) return;
      gsap.to(face, { xPercent: 30, yPercent: -12, duration: 0.25 });   // eyes up at the arrow
      // a small springy hop: crouch, stretch up, land, wobble — then again while it's hovered
      hopLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.9 })
        .to(bodyEl, { scaleX: 1.14, scaleY: 0.86, duration: 0.12, ease: 'power1.out' })
        .to(bodyEl, { y: () => -size() * 0.32, scaleX: 0.9, scaleY: 1.12, duration: 0.22, ease: 'power2.out' })
        .to(bodyEl, { y: 0, scaleX: 1.12, scaleY: 0.88, duration: 0.2, ease: 'power2.in' })
        .to(bodyEl, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' });
    };
    const leave = () => {
      hopLoop?.kill(); hopLoop = null;
      gsap.to(bodyEl, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.35, ease: 'power2.out' });
      gsap.to(face, { xPercent: 16, yPercent: 0, duration: 0.3 });
    };
    // click: Blobby swells to fill the screen, face and all, and the About page opens underneath
    // (it lands in its corner there: see HeroAvatar). Without Blobby by the link, a plain page change.
    const go = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;   // new tab etc.: leave it
      e.preventDefault();
      hopLoop?.kill(); hopLoop = null;
      if (!atLink()) { router.push(about.link.href); return; }
      track('Open about · Blobby');
      gsap.set(orb, { opacity: 0 });
      blobGrow(bodyEl!, orb.classList.contains('is-asleep'), () => router.push(about.link.href));
    };
    linkEl.addEventListener('mouseenter', enter);
    linkEl.addEventListener('focus', enter);
    linkEl.addEventListener('mouseleave', leave);
    linkEl.addEventListener('blur', leave);
    linkEl.addEventListener('click', go);

    return () => {
      linkEl.removeEventListener('mouseenter', enter);
      linkEl.removeEventListener('focus', enter);
      linkEl.removeEventListener('mouseleave', leave);
      linkEl.removeEventListener('blur', leave);
      linkEl.removeEventListener('click', go);
      hopLoop?.kill();
      ScrollTrigger.removeEventListener('refreshInit', onInit);
      ScrollTrigger.removeEventListener('refresh', onDone);
      gsap.killTweensOf(orb);
    };
  }, { scope: root });

  return (
    <section ref={root} className="about section" id="about">
      {/* the home page's light, condensed into a small companion that reads along */}
      <span className="about__orb" aria-hidden="true">
        <span className="about__orb-body"><span className="about__orb-ink" /><span className="about__orb-face"><i /><i /></span></span>
      </span>
      <div className="about__inner">
        <h2 className="headline" aria-label={about.headline.join(' ')}>
          {about.headline.map((line) => {
            // the jumbling phrase sits in its own fixed-width box so the line never shifts while letters change
            const at = line.indexOf(about.scramble);
            return (
              <span key={line} className="about__line" aria-hidden="true">
                {at < 0 ? line : (
                  <>
                    {line.slice(0, at)}
                    <span className="about__scr" data-text={about.scramble}>{about.scramble}</span>
                    {line.slice(at + about.scramble.length)}
                  </>
                )}
              </span>
            );
          })}
        </h2>

        <div className="about__text">
          <p className="lead" aria-label={about.body}>
            {words.map((w, i) => {
              // a space inside a phrase is highlighted with it; any other space sits between the words
              const inside = i < words.length - 1 && phraseOf[i] >= 0 && phraseOf[i + 1] === phraseOf[i];
              return (
                <Fragment key={i}>
                  <span className="about__word" aria-hidden="true" data-hl={phraseOf[i] >= 0 ? phraseOf[i] : undefined}>{w}{inside ? ' ' : ''}</span>
                  {!inside && i < words.length - 1 ? ' ' : null}
                </Fragment>
              );
            })}
          </p>
          <a className="about__sign" href={about.link.href}>
            {about.link.label}<span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
