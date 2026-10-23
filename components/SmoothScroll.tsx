'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/motion';

/** Where each page was left (by its path and query), kept for the tab so a reload finds it too. */
const STORE = 'v2-scroll';
const pageKey = () => window.location.pathname + window.location.search;

/** ScrollTrigger moves in the same frame as the smoothed scroll (Lenis exists only after its first render). */
const syncTriggers = () => { ScrollTrigger.update(); };
function TriggerSync() {
  useLenis(syncTriggers);
  return null;
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * animations stay in lockstep with the smoothed scroll position.
 * Anchor links (#about, …) glide instead of jumping.
 * It glides softly and moves a little less per wheel step, so the held scenes can't be skipped.
 *
 * Moving between pages: a new page starts at its top (a glide still running on the last page stops there), and back
 * and forward return to where the page was left. The browser can't do that itself here: it restores the position
 * before the page has drawn, while the held scenes and the picture grid still have another height, so it landed in
 * the wrong place (or at the top of a short page). So the site keeps the positions and puts them back once the page
 * has its real height.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const saved = useRef(new Map<string, number>());
  /** the page on screen */
  const shown = useRef<string | null>(null);
  /** back or forward: where the coming page was left (null on any other change) */
  const back = useRef<number | null>(null);
  /** the last page change was back or forward, so it does not land on its #section */
  const popped = useRef(false);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  // remember where every page is while it is on screen; back and forward pick the place up (declared before the
  // effect below, so the positions are loaded when it first runs)
  useLayoutEffect(() => {
    const { history } = window;
    history.scrollRestoration = 'manual';
    try { for (const [k, v] of JSON.parse(sessionStorage.getItem(STORE) ?? '[]')) saved.current.set(k, v); } catch { /* none kept */ }
    // not while a back or forward is still on its way: the old page's position would be filed under the new address
    const keep = () => { if (back.current === null && shown.current) saved.current.set(shown.current, Math.round(window.scrollY)); };
    let unclaimed: ReturnType<typeof setTimeout> | undefined;
    const onPop = () => {
      const key = pageKey();
      // only the #section changed: the page stays where it is
      if (key === shown.current) return;
      const to = saved.current.get(key) ?? 0;
      back.current = to;
      // only the query changed (the same page, e.g. a work filter): no page change picks it up, so let it go
      clearTimeout(unclaimed);
      unclaimed = setTimeout(() => { if (back.current === to && shown.current !== pageKey()) back.current = null; }, 1500);
    };
    const store = () => {
      keep();
      try { sessionStorage.setItem(STORE, JSON.stringify([...saved.current].slice(-60))); } catch { /* storage off */ }
    };
    const onHide = () => { if (document.visibilityState === 'hidden') store(); };
    window.addEventListener('scroll', keep, { passive: true });
    window.addEventListener('popstate', onPop);
    window.addEventListener('pagehide', store);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearTimeout(unclaimed);
      window.removeEventListener('scroll', keep);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('pagehide', store);
      document.removeEventListener('visibilitychange', onHide);
      history.scrollRestoration = 'auto';
    };
  }, []);

  // runs after the new page's own layout effects (its held scenes have their height) and after Next.js has put a new
  // page at the top, before anything is painted
  useLayoutEffect(() => {
    const key = pageKey();
    if (shown.current === null) {
      // the first page: a reload, or back from another site, returns to where it was
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.type !== 'navigate' && saved.current.has(key)) back.current = saved.current.get(key)!;
    }
    shown.current = key;
    const to = back.current;
    popped.current = to !== null;
    // Lenis takes the page's length and position as they are now: a glide still running from the last page must not
    // carry on here (it would pull the new page down to where the old one was going)
    const settle = () => {
      const l = lenisRef.current?.lenis;
      if (!l) return;
      l.dimensions.resize();
      if (l.isScrolling === 'smooth' && !l.isStopped) { l.stop(); l.start(); }
      const y = window.scrollY;
      if (l.targetScroll !== y) l.scrollTo(y, { immediate: true, force: true });
    };
    if (to === null) {
      settle();
      return;
    }
    // back or forward: to where the page was left, and again each time the page's length still changes while its
    // pictures and measured rows settle (the browser would otherwise keep what was on screen at the early length),
    // until the visitor scrolls or the page has settled
    let done = false;
    const raf: number[] = [];
    const stopOn = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const grows = new ResizeObserver(() => jump());
    const jump = () => {
      if (done) return;
      settle();
      window.scrollTo({ top: to, behavior: 'instant' });
      settle();
    };
    const finish = () => {
      if (done) return;
      done = true;
      back.current = null;
      raf.forEach(cancelAnimationFrame);
      clearTimeout(late);
      grows.disconnect();
      stopOn.forEach((t) => window.removeEventListener(t, finish));
      saved.current.set(key, Math.round(window.scrollY));
    };
    stopOn.forEach((t) => window.addEventListener(t, finish, { passive: true }));
    jump();
    grows.observe(document.body);
    raf.push(requestAnimationFrame(() => { jump(); raf.push(requestAnimationFrame(jump)); }));
    const late = setTimeout(() => { jump(); finish(); }, 1500);
    return finish;
  }, [pathname]);

  // a link to a section (/#contact) lands on it once the page has laid out its held scenes, and again when only the
  // # changes on the same page (not on back and forward: those return to where the page was left)
  useEffect(() => {
    const go = (glide: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      const lenis = lenisRef.current?.lenis;
      if (!el || !lenis) return;
      ScrollTrigger.refresh();
      lenis.scrollTo(el, { immediate: !glide, force: true, offset: 0 });
    };
    const t = popped.current ? undefined : setTimeout(() => go(false), 450);
    const onHash = () => go(true);
    window.addEventListener('hashchange', onHash);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', onHash); };
  }, [pathname]);

  const options = { autoRaf: false, lerp: 0.075, wheelMultiplier: 0.85, touchMultiplier: 1, anchors: { offset: 0 }, stopInertiaOnNavigate: true };

  return (
    <ReactLenis root ref={lenisRef} options={options}>
      <TriggerSync />
      {children}
    </ReactLenis>
  );
}
