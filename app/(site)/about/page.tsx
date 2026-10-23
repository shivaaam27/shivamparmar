import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { AboutBelief, AboutOpen } from '@/components/site/AboutScenes';
import ShippedRow from '@/components/site/ShippedRow';
import ProductRows from '@/components/site/ProductRows';
import { ServicesBlock, ServicesLd } from '@/components/site/Views';
import { V2Contact } from '@/components/site/Home';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: 'About Shivam Parmar, who runs Shivo Labs, a freelance software and digital solutions business in Dar es Salaam: the services, the Shivo Labs apps, and the work behind them.',
  alternates: { canonical: '/about' },
};

/**
 * /about, told as held scenes like the home page: hello → the belief and the figures → highlights → the Shivo Labs
 * products → the services → contact. Each scene ends on the colour the next starts with.
 */
export default function AboutPage() {
  return (
    <main id="main" className="v2-home v2-aboutp">
      <ServicesLd />
      <AboutOpen />
      <AboutBelief />
      {/* on the cream: what I have built and shipped in one row, and the products in two */}
      <div className="v2-cream">
        <ShippedRow />
        <ProductRows />
      </div>
      <section id="services" className="v2-aboutp__services" aria-label="Services">
        <ServicesBlock lang="en" level="h2" />
      </section>
      <V2Contact />
    </main>
  );
}
