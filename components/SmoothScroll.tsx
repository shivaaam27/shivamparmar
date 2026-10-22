'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, type LenisRef } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/motion';
import { isV2Path } from '@/lib/v2';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * animations stay in lockstep with the smoothed scroll position.
 * Anchor links (#about, …) glide instead of jumping.
 * Version 2 glides a little softer and moves a little less per wheel step, so its held scenes can't be skipped.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const isV2 = isV2Path(pathname);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    lenis?.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off('scroll', ScrollTrigger.update);
    };
  }, [isV2]);

  // a new page starts where the browser puts it, without gliding there from the last page's position
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis.resize();
  }, [pathname]);

  // a link to a section (/v2#contact) lands on it once the page has laid out its held scenes, and again when only the
  // # changes on the same page
  useEffect(() => {
    const go = (glide: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      const lenis = lenisRef.current?.lenis;
      if (!el || !lenis) return;
      ScrollTrigger.refresh();
      lenis.scrollTo(el, { immediate: !glide, force: true, offset: 0 });
    };
    const t = setTimeout(() => go(false), 450);
    const onHash = () => go(true);
    window.addEventListener('hashchange', onHash);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', onHash); };
  }, [pathname]);

  const options = isV2
    ? { autoRaf: false, lerp: 0.075, wheelMultiplier: 0.85, touchMultiplier: 1, anchors: { offset: 0 } }
    : { autoRaf: false, lerp: 0.09, anchors: { offset: 0 } };

  return (
    <ReactLenis key={isV2 ? 'v2' : 'v1'} root ref={lenisRef} options={options}>
      {children}
    </ReactLenis>
  );
}
