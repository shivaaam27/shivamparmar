import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import Tag from '@/components/Tag';
import { aboutPage, site } from '@/lib/content';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: aboutPage.intro[0],
};

export default function AboutPage() {
  const { headline, intro, disciplinesTag, disciplines, closing } = aboutPage;
  return (
    <>
      <Header />
      <main id="main" className="page">
        {/* intro */}
        <section className="section page__intro">
          <h1 className="headline headline--left reveal">
            <Tag>{aboutPage.tag}</Tag>
            {headline.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
          </h1>
          <div className="page__intro-text">
            {intro.map((p, i) => (
              <p key={i} className="lead reveal" data-delay={i + 1}>{p}</p>
            ))}
          </div>
        </section>

        {/* disciplines */}
        <section className="section disciplines" aria-labelledby="disciplines-title">
          <h2 id="disciplines-title" className="disciplines__tag reveal"><Tag>{disciplinesTag}</Tag></h2>
          <ol className="disciplines__list">
            {disciplines.map((d, i) => (
              <li key={d.title} className="discipline reveal">
                <span className="discipline__num mono">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="discipline__title">{d.title}</h3>
                <p className="discipline__text">{d.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* closing */}
        <section className="section page__closing">
          <p className="headline headline--left reveal">
            {closing.headline.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
          </p>
          <a className="about__sign reveal" data-delay="1" href={closing.link.href}>
            {closing.link.label}<span aria-hidden="true">→</span>
          </a>
        </section>
      </main>
      <Footer />
      <Effects />
    </>
  );
}
