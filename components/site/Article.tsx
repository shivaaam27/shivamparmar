'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLenis } from 'lenis/react';
import { WORDS, isRtl, type PostLang } from '@/lib/post-lang';

type Toc = { id: string; text: string }[];
const SIZES = [.92, 1, 1.1, 1.22];

/**
 * A journal post's reading column (docs/SITE.md, "Journal"): the text at a steady, comfortable width; beside it on
 * wide screens a small "In this article" list that stays in view and marks the section being read (on phones it opens
 * from a button); a control for the text size, remembered in this browser. Headings rise in once as they arrive; the
 * words themselves never move.
 */
export default function Article({ html, toc, lang }: { html: string; toc: Toc; lang: PostLang }) {
  const body = useRef<HTMLDivElement>(null);
  const aside = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [current, setCurrent] = useState(toc[0]?.id ?? '');
  const [size, setSize] = useState(SIZES[0]); // the smallest is the default; a size chosen with the buttons is remembered
  const [open, setOpen] = useState(false);
  const w = WORDS[lang];

  useEffect(() => {
    try { const s = Number(localStorage.getItem('v2-text-size')); if (SIZES.includes(s)) setSize(s); } catch { /* storage off */ }
  }, []);
  const pick = (s: number) => { setSize(s); try { localStorage.setItem('v2-text-size', String(s)); } catch { /* storage off */ } };

  // which section is being read: the last heading above the upper third of the screen
  useEffect(() => {
    const el = body.current;
    if (!el || !toc.length) return;
    const heads = toc.map((t) => el.querySelector<HTMLElement>(`#${CSS.escape(t.id)}`)).filter((h): h is HTMLElement => Boolean(h));
    let frame = 0;
    const update = () => {
      frame = 0;
      let at = heads[0]?.id ?? '';
      for (const h of heads) if (h.getBoundingClientRect().top < window.innerHeight * .35) at = h.id;
      setCurrent(at);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [toc]);

  // headings rise in once
  useEffect(() => {
    const el = body.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const heads = el.querySelectorAll('h2, h3, blockquote');
    heads.forEach((h) => h.classList.add('v2-art__wait'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [html]);

  // a section from the list: the list closes first (on phones it sits above the text, so closing it moves the text
  // up), then one glide to the heading, clear of the bar that stays at the top on phones. The click goes no further,
  // or the smooth scrolling would start a second glide of its own to the same # and the two would fight.
  const jump = (id: string) => (e: React.MouseEvent) => {
    const h = document.getElementById(id);
    if (!h) return;
    e.preventDefault();
    e.stopPropagation();
    flushSync(() => setOpen(false));
    const side = aside.current, text = body.current;
    const stacked = side && text && side.getBoundingClientRect().right > text.getBoundingClientRect().left;
    const clear = stacked ? parseFloat(getComputedStyle(side).top) + side.offsetHeight + 16 : 110;
    const top = h.getBoundingClientRect().top + window.scrollY - clear;
    if (lenis) lenis.scrollTo(top, { force: true });
    else window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="v2-art" style={{ '--size': size } as React.CSSProperties}>
      <aside ref={aside} className="v2-art__side">
        <div className="v2-art__tools">
          {toc.length > 1 && (
            <button type="button" className="v2-art__tocbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="art-toc">
              {w.inArticle}
            </button>
          )}
          <div className="v2-art__size" role="group" aria-label={w.textSize}>
            {SIZES.map((s, i) => (
              <button key={s} type="button" aria-pressed={s === size} onClick={() => pick(s)} aria-label={`${w.size} ${i + 1}`} style={{ fontSize: `${.72 + i * .14}rem` }}>A</button>
            ))}
          </div>
        </div>
        {toc.length > 1 && (
          <nav id="art-toc" className={`v2-art__toc${open ? ' is-open' : ''}`} aria-label={w.inArticle}>
            <p className="v2-art__tock">{w.inArticle}</p>
            <ol>
              {toc.map((t) => (
                <li key={t.id}><a href={`#${t.id}`} dir="auto" onClick={jump(t.id)} aria-current={t.id === current ? 'location' : undefined}>{t.text}</a></li>
              ))}
            </ol>
          </nav>
        )}
      </aside>
      <div ref={body} className="v2-prose v2-art__text" lang={lang} dir={isRtl(lang) ? 'rtl' : undefined} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
