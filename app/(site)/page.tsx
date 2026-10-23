import type { Metadata } from 'next';
import V2Hero from '@/components/site/Hero';
import V2WorkScene from '@/components/site/WorkScene';
import ProductRows from '@/components/site/ProductRows';
import { V2Contact } from '@/components/site/Home';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/** Home: hero → about → the cream page (work, products) → contact (docs/SITE.md). */
export default function HomePage() {
  return (
    <main id="main" className="v2-home">
      {/* one screen that stays put: the hero turns into About, then the cream page rises over it */}
      <V2Hero />
      <V2WorkScene><ProductRows /></V2WorkScene>
      <V2Contact />
    </main>
  );
}
