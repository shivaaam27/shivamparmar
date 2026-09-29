import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import WorkBrowser from '@/components/WorkBrowser';
import { site } from '@/lib/content';
import { workData } from '@/lib/work-data';

export const metadata: Metadata = {
  title: `Work — ${site.fullName}`,
  description: 'Selected work by Shivam Parmar: business systems and dashboards, and photography from Tanzania: hotels, brands, wildlife and places.',
  alternates: { canonical: '/work' },
  openGraph: { url: '/work', title: `Work — ${site.fullName}` },
};

/** All work: every category, every collection, every picture. */
export default function WorkPage() {
  return (
    <>
      <Header />
      <main id="main" className="page work-page">
        <section className="section work-page__body" aria-label="Work">
          <WorkBrowser cats={workData()} initial={{ c: null, s: null }} />
        </section>
      </main>
      <Footer />
      <Effects />
    </>
  );
}
