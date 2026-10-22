import type { Metadata } from 'next';
import V2Hero from '@/components/site/Hero';
import V2WorkScene from '@/components/site/WorkScene';
import { BrandsGrid } from '@/components/site/Brands';
import V2Showcase from '@/components/site/Showcase';
import { V2Contact } from '@/components/site/Home';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/** Home: hero → about → work → products film → logos → contact (docs/SITE.md). */
export default function HomePage() {
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
