import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import Tag from '@/components/Tag';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
};

/** Placeholder until the full about page is written. */
export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <section className="section page__intro">
          <h1 className="headline headline--left reveal">
            <Tag>About</Tag>
            More about me<br />is on its way.
          </h1>
          <a className="about__sign reveal" data-delay="1" href="/">
            <span aria-hidden="true">←</span>Back to home
          </a>
        </section>
      </main>
      <Footer />
      <Effects />
    </>
  );
}
