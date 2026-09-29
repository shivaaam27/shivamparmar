'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectCoverflow, Keyboard, Mousewheel, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export type CarouselShot = { src: string; alt: string; project: string; slug: string };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Full-screen photo viewer: a coverflow carousel (the picture in front, its
 * neighbours turned away on either side), a strip of tiny thumbnails under it
 * to jump anywhere, and the position dots below that. Arrows, ← / → keys,
 * swipe, drag or the wheel move through it; Esc or Close leaves.
 * Adapted from Skiper UI's Carousel_003 (Skiper 49) and a Framer thumbnail strip.
 */
export default function PhotoCarousel({ shots, start, onClose }: { shots: CarouselShot[]; start: number; onClose: () => void }) {
  const swiper = useRef<SwiperType | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(start);
  const shot = shots[at];

  // keep the page behind still; Esc closes
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { html.style.overflow = before; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // keep the chosen thumbnail in the middle of the strip
  useEffect(() => {
    const el = strip.current, t = el?.querySelectorAll('button')[at];
    if (el && t) el.scrollTo({ left: t.offsetLeft - el.clientWidth / 2 + 29, behavior: 'smooth' });   // 29 ≈ half the open thumbnail
  }, [at]);

  return (
    <div className="pc" role="dialog" aria-modal="true" aria-label="Photos" data-lenis-prevent>
      <header className="pc__bar mono">
        <span aria-live="polite">{pad(at + 1)} / {pad(shots.length)}</span>
        <Link className="pc__project" href={`/work/${shot.slug}`}>{shot.project}<span aria-hidden="true"> ↗</span></Link>
        <button type="button" className="pc__close" onClick={onClose} autoFocus>Close<X size={14} aria-hidden="true" /></button>
      </header>

      <div className="pc__stage">
        <button type="button" className="pc__arrow pc__arrow--prev" onClick={() => swiper.current?.slidePrev()} disabled={at === 0} aria-label="Previous photo">
          <ChevronLeft size={18} />
        </button>
        <Swiper
          className="pc__swiper"
          modules={[EffectCoverflow, Keyboard, Mousewheel, Pagination]}
          effect="coverflow"
          coverflowEffect={{ rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          slidesPerView="auto"
          centeredSlides
          grabCursor
          initialSlide={start}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: false, thresholdDelta: 10 }}
          pagination={{ el: '.pc__dots', clickable: true, dynamicBullets: shots.length > 12 }}
          onSwiper={(s) => { swiper.current = s; }}
          onSlideChange={(s) => setAt(s.activeIndex)}
        >
          {shots.map((s, i) => (
            <SwiperSlide key={s.src} className="pc__slide">
              <img src={s.src} alt={s.alt} loading={Math.abs(i - start) < 4 ? 'eager' : 'lazy'} draggable={false} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button type="button" className="pc__arrow pc__arrow--next" onClick={() => swiper.current?.slideNext()} disabled={at === shots.length - 1} aria-label="Next photo">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="pc__foot">
        <div className="pc__thumbs" ref={strip} role="tablist" aria-label="All photos">
          {shots.map((s, i) => (
            <button key={s.src} type="button" role="tab" aria-selected={i === at} aria-label={`Photo ${i + 1}: ${s.project}`}
              className={i === at ? 'is-on' : undefined} onClick={() => swiper.current?.slideTo(i)}>
              <img src={s.src} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
        <div className="pc__dots" />
      </div>
    </div>
  );
}
