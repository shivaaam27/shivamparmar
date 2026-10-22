import type { Metadata } from 'next';
import V2Hero from '@/components/v2/Hero';
import V2WorkScene from '@/components/v2/WorkScene';
import { BrandsGrid } from '@/components/v2/BrandsScene';
import V2Showcase from '@/components/v2/Showcase';
import { V2Contact } from '@/components/v2/Home';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/** V2 home: hero → about → work → products film → logos → contact (docs/V2-PLAN.md). */
export default function HomeV2() {
  return (
    <main id="main" className="v2-home">
      {/* one screen that stays put: the hero turns into About, then the page scrolls on */}
      <V2Hero />
      <V2WorkScene />
      {/* one held screen: the products film, then the same screen turns cream and becomes the brands */}
      <V2Showcase><BrandsGrid /></V2Showcase>
      <V2Contact />
    </main>
  );
}
