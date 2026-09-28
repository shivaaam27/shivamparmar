'use client';

import { useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/motion';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * animations stay in lockstep with the smoothed scroll position.
 * Anchor links (#about, …) glide instead of jumping.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

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
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.09, anchors: { offset: 0 } }}>
      {children}
    </ReactLenis>
  );
}
