'use client';

import { Fragment, useRef } from 'react';
import { about } from '@/lib/content';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import { awakeNow } from './HeroAvatar';

/** Phrases the companion highlights as the description fills in. */
const KEY_PHRASES = ['custom systems', 'photography and design', 'AI workflows'];
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Scroll-told intro: the section pins, "Hi, I'm Shivam" rises in, then the
 * rest of the headline, then the description fills word by word from grey
 * to ink as you keep scrolling, and the link arrives last.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
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
      // "Hi, I'm Shivam" rises out of the setting light: it starts where the SHIVAM mark sits,
      // small, soft and faint, and travels up into place, sharpening as it goes
      const fromMark = () => {
        const mark = document.querySelector('.hero .jumble');
        if (!mark || !root.current) return 120;
        const m = mark.getBoundingClientRect();
        const f = first.getBoundingClientRect();
        const lineMid = f.top + f.height / 2 - Number(gsap.getProperty(first, 'y')) - root.current.getBoundingClientRect().top;
        return Math.max(60, m.top + m.height / 2 - lineMid);
      };
      tl.to({}, { duration: 0.5 })
        .fromTo(first, { y: fromMark, scale: 0.9, filter: 'blur(10px)' },
          { y: 0, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'sine.inOut' }, 'rise')
        // it comes into view on the way up, just as the old mark finishes fading
        .fromTo(first, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' }, 'rise+=0.15');
    }
    const STEP = 0.11; // how fast the description fills, word by word (room for Blobby to rest between phrases)
    tl.fromTo(rest, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.35, ease: 'power2.out' }, overHero ? '-=0.35' : undefined)
      // the description arrives in full, in grey, as the headline finishes…
      .fromTo(body, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      // …then fills to ink word by word
      .addLabel('fill', '+=0.1')
      .fromTo(bodyWords, { opacity: 0.22 }, { opacity: 1, duration: 0.3, stagger: STEP, ease: 'none' }, 'fill')
      .fromTo(link, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
      .addLabel('linked')
      .to({}, { duration: 0.6 }); // a short beat of stillness before the pin releases

    const hlWords = q('.about__word[data-hl]');
    const phrases = KEY_PHRASES.map((_, k) => hlWords.filter((w) => w.dataset.hl === String(k))).filter((ws) => ws.length);
    const F = tl.labels.fill;   // when the word-by-word fill starts, in timeline seconds
    const startOf = (ws: HTMLElement[]) => F + bodyWords.indexOf(ws[0]) * STEP;
    const wipe = (w: HTMLElement, at: number, d = 0.22) =>
      tl.fromTo(w, { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', duration: d, ease: 'none' }, at);

    // ---- Blobby: the hero's light condensed into a small companion that reads along
    const orb = root.current?.querySelector<HTMLElement>('.about__orb');
    if (!overHero || !orb || !root.current) {
      // no companion: the phrases simply get their stroke as the fill reaches them
      hlWords.forEach((w) => wipe(w, F + bodyWords.indexOf(w) * STEP + 0.05));
      return;
    }
    orb.classList.toggle('is-asleep', !awakeNow());
    const face = orb.querySelector('.about__orb-face');
    const ink = orb.querySelector('.about__orb-ink');
    const R = () => root.current!.getBoundingClientRect();
    const size = () => orb.offsetWidth;
    const bodyY = () => Number(gsap.getProperty(body[0], 'y'));
    // beside the end of "Hi, I'm Shivam," (measured without the line's own motion)
    const besideName = () => {
      const r = R(), h = first.parentElement!.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(first);
      const textW = range.getBoundingClientRect().width / Number(gsap.getProperty(first, 'scale') || 1);
      // offsetTop is already measured from this section (it's the line's positioned ancestor)
      return { x: h.left - r.left + h.width / 2 + textW / 2 + size() * 1.15, y: first.offsetTop + first.offsetHeight * 0.45 };
    };
    // where a phrase's highlighter stroke runs: along its first line, through the middle of the stroke
    const stroke = (ws: HTMLElement[]) => {
      const r = R(), dy = bodyY();
      const rects = ws.map((w) => w.getBoundingClientRect());
      const line = rects.filter((rc) => Math.abs(rc.top - rects[0].top) < 4);
      const x0 = line[0].left - r.left, x1 = line[line.length - 1].right - r.left;
      return { x0, x1, y: rects[0].top - dy - r.top + rects[0].height * 0.72, h: rects[0].height * 0.42, onLine: line.length };
    };
    const linkSpot = () => {
      const r = R(), l = link[0].getBoundingClientRect();
      const dy = Number(gsap.getProperty(link[0], 'y'));
      return { x: l.left - r.left - size() * 1.1, y: l.top - dy - r.top + l.height / 2 };
    };

    // stage 2: it grows out of the setting dome and condenses up beside the name;
    // it starts exactly over the dome's face, the same size, so the dome's eyes become its eyes
    const dome = () => {
      const H = window.innerHeight, D = Math.min(H * 0.97, window.innerWidth * 1.9);
      const k = (0.137 * D) / (0.39 * size());               // dome face width ÷ orb face width
      return { k, x: window.innerWidth / 2 - R().left, y: H - 0.6 * D + 0.33 * D + 0.1 * size() * k - R().top };
    };
    tl.fromTo(orb,
      { x: () => dome().x, y: () => dome().y, scale: () => dome().k },
      { x: () => besideName().x, y: () => besideName().y, scale: 1, duration: 2.4, ease: 'power2.inOut', immediateRender: true }, 'rise')
      .fromTo(orb, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power1.out', immediateRender: true }, 'rise')
      .to(face, { xPercent: -16, duration: 0.6 }, 'rise+=1.8');

    // to get somewhere across the text it never glides over words: it shrinks away and pops up there
    const hop = (to: () => { x: number; y: number }, at: number) => {
      tl.to(orb, { opacity: 0, scale: 0.4, duration: 0.15, ease: 'power1.in' }, at)
        .set(orb, { x: () => to().x, y: () => to().y }, '>')
        .to(orb, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.2)' }, '>');
    };

    // stage 3: for each key phrase it becomes the highlighter — pops up at the phrase, squashes flat
    // into a lilac stroke, sweeps along the words (leaving the stroke on them), then pulls itself
    // back into a blob at the end of the phrase and looks back at what it marked
    phrases.forEach((ws) => {
      const t0 = startOf(ws);
      const sweep = ws.length * STEP + 0.2;
      hop(() => ({ x: stroke(ws).x0 + size() * 0.5, y: stroke(ws).y }), t0 - 0.42);
      tl.to(face, { xPercent: 16, duration: 0.15 }, '<')
        // squash: it gets small and flat, its face tucks away, it turns highlighter-lilac
        .to(orb, { scaleX: 0.7, scaleY: 0.42, duration: 0.12, ease: 'power2.in' }, t0)
        .to(face, { opacity: 0, duration: 0.1 }, '<')
        .to(ink, { opacity: 1, duration: 0.12 }, '<')
        // sweep: it stretches along the phrase as the stroke
        .to(orb, {
          x: () => (stroke(ws).x0 + stroke(ws).x1) / 2,
          scaleX: () => (stroke(ws).x1 - stroke(ws).x0) / size(),
          scaleY: () => stroke(ws).h / size(),
          duration: sweep, ease: 'power1.inOut',
        }, '>');
      // the stroke it leaves behind, word by word, in step with the sweep
      const n = ws.length;
      ws.forEach((w, i) => wipe(w, t0 + 0.12 + (sweep * i) / n, sweep / n));
      // pop: back into a blob just past the phrase, with a little overshoot, eyes on the phrase
      tl.to(orb, {
        x: () => stroke(ws).x1 + size() * 0.75,
        scaleX: 1, scaleY: 1, duration: 0.32, ease: 'back.out(2)',
      }, t0 + 0.12 + sweep)
        .to(ink, { opacity: 0, duration: 0.2 }, '<')
        .to(face, { opacity: 1, xPercent: -16, duration: 0.2 }, '<+=0.08');
    });
    // then it hops beside "Read more about me" and looks at it
    hop(linkSpot, tl.labels.linked - 0.6);
    tl.to(face, { xPercent: 16, duration: 0.2 }, '<');
  }, { scope: root });

  return (
    <section ref={root} className="about section" id="about">
      {/* the home page's light, condensed into a small companion that reads along */}
      <span className="about__orb" aria-hidden="true">
        <span className="about__orb-body"><span className="about__orb-ink" /><span className="about__orb-face"><i /><i /></span></span>
      </span>
      <div className="about__inner">
        <h2 className="headline">
          {about.headline.map((line) => <span key={line} className="about__line">{line}</span>)}
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
