import type { Metadata } from 'next';
import Link from 'next/link';
import { Aperture, ArrowUpRight, Camera, Images, Layers, LayoutDashboard, LayoutGrid, Mail, MessageCircle, PenTool, Phone, Pill, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import AboutShell from '@/components/about/AboutShell';
import Glow from '@/components/about/Glow';
import Odometer from '@/components/about/Odometer';
import Reveal from '@/components/about/Reveal';
import Timeline from '@/components/about/Timeline';
import LogoRows from '@/components/LogoRows';
import { aboutPage, nav, site } from '@/lib/content';
import { pagedProjects, visibleCategories } from '@/lib/work';
import './about.css';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: 'About Shivam Parmar, who runs Shivo Labs, a freelance software and digital solutions business in Dar es Salaam: pharmacist (BPharm, MSc Pharmacovigilance), photographer and systems builder. Websites, apps, custom business systems, AI workflows and MCP servers.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: `About — ${site.fullName}` },
};

const pad = (n: number) => String(n).padStart(2, '0');
const ICONS = [LayoutDashboard, Sparkles, PenTool, Camera, Pill];
const wa = (n: string) => `https://wa.me/${n}`;

export default function AboutPage() {
  const { sections, headline, eyebrow, intro, facts, disciplines, highlights, clients, experience, hello, ending } = aboutPage;
  const projects = pagedProjects();
  const photo = visibleCategories().find((c) => c.slug === 'photography');
  const photos = projects.filter((p) => p.category.slug === 'photography').reduce((n, p) => n + (p.project.images?.length ?? 0), 0);
  const stats = [
    { value: projects.length, label: 'Projects on this site', Icon: LayoutGrid },
    { value: photo?.subcategories.length ?? 0, label: 'Photo collections', Icon: Images },
    { value: photos, label: 'Photographs', Icon: Aperture },
    { value: disciplines.length, label: 'Disciplines, one way of working', Icon: Layers },
  ];
  const [phone] = site.phones;

  // 08 index: a photo across the top, then the quick ways in, the site by type and contact, split by thin lines
  const byType = Object.values(projects.reduce((m, { category }) => {
    (m[category.slug] ??= { slug: category.slug, name: category.name, n: 0 }).n += 1;
    return m;
  }, {} as Record<string, { slug: string; name: string; n: number }>));
  const endingPanel = (
    <section id="index" className="ab-sec ab-end" aria-label="Index">
      <div className="ab-end__art">
        <img src={ending.photo} alt="" loading="lazy" />
      </div>
      <div className="ab-end__body">
        <div className="ab-end__top">
          <p><b>Got a question?</b><a href={`mailto:${site.email}`}>Get in touch</a></p>
          <p><b>Quicker on the phone?</b><a href={wa(phone.wa)} target="_blank" rel="noopener">WhatsApp me</a></p>
          <p><b>See what I make</b><Link href="/work">Browse the work</Link></p>
        </div>
        <hr className="ab-end__rule" />
        <div className="ab-end__lists">
          <div>
            <p className="ab-end__h">Work by type</p>
            <ul className="ab-end__list">
              {byType.map((c) => <li key={c.slug}><Link href={`/work/${c.slug}`}>{c.name}</Link><span>{c.n}</span></li>)}
            </ul>
          </div>
          <div>
            <p className="ab-end__h">Disciplines</p>
            <ul className="ab-end__list">
              {disciplines.map((d) => <li key={d.title}><a href="#services">{d.title}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="ab-end__h">Pages</p>
            <ul className="ab-end__list">
              {nav.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="ab-end__h">Contact</p>
            <ul className="ab-end__list">
              <li><a href={`mailto:${site.email}`}>Email</a><span>{site.email}</span></li>
              {site.phones.map((p) => <li key={p.tel}><a href={`tel:${p.tel}`}>Call</a><span>{p.label}</span></li>)}
              {site.phones.map((p) => <li key={p.wa}><a href={wa(p.wa)} target="_blank" rel="noopener">WhatsApp</a><span>{p.label}</span></li>)}
              <li><span className="ab-end__plain">{site.location}</span></li>
            </ul>
          </div>
        </div>
        <hr className="ab-end__rule" />
        <a className="ab-btn ab-btn--ink ab-end__cta" href={`mailto:${site.email}?subject=New%20project`} data-umami-event="Contact · About start project">
          {ending.cta}<ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );

  return (
    <>
      <Header />
      <main id="main" className="page about-page">
        <AboutShell sections={sections} end={endingPanel}>
          {/* 01 intro */}
          <section id="intro" className="ab-sec ab-intro-sec" aria-label="Intro">
            <p className="ab-eyebrow">{eyebrow}</p>
            <h2 className="ab-hello">{headline.join(' ')}</h2>
            <p className="ab-lead">{intro[0]}</p>
            <div className="ab-actions">
              <Link className="ab-btn ab-btn--ink" href="/work">See the work<ArrowUpRight size={15} aria-hidden="true" /></Link>
              <a className="ab-btn" href={`mailto:${site.email}`} data-umami-event="Contact · About email">Email me</a>
            </div>
          </section>

          {/* 02 numbers */}
          <section id="numbers" className="ab-sec" aria-label="At a glance">
            <p className="ab-label">At a glance</p>
            <Reveal as="ul" className="ab-stats">
              {stats.map(({ value, label, Icon }, i) => (
                <Glow key={label} as="li" seed={i} className="ab-stat">
                  <span className="ab-stat__top">
                    <span className="ab-stat__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.4} /></span>
                    <span className="ab-stat__n mono" aria-hidden="true">{pad(i + 1)}</span>
                  </span>
                  <b><Odometer value={value} /></b>
                  <span className="ab-stat__label">{label}</span>
                </Glow>
              ))}
            </Reveal>
            <p className="ab-text">{intro[1]}</p>
            <dl className="ab-facts" aria-label="Quick facts">
              {facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
          </section>

          {/* 03 what I do */}
          <section id="services" className="ab-sec" aria-label="What I do">
            <p className="ab-label">What I do</p>
            <h2 className="ab-h2">Five disciplines,<br />one way of working.</h2>
            {/* each card deep green, lit warm from below, and each lit a little differently */}
            <Reveal as="ul" className="ab-cards" threshold={0.15}>
              {disciplines.map((d, i) => {
                const Icon = ICONS[i] ?? Sparkles;
                return (
                  <Glow key={d.title} as="li" seed={i} tone="deep" className="ab-card" style={{ '--i': i } as React.CSSProperties}>
                    <div className="ab-card__top">
                      <span className="ab-card__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.4} /></span>
                      <span className="ab-card__n mono" aria-hidden="true">{pad(i + 1)}</span>
                    </div>
                    <div className="ab-card__body">
                      <h3 className="ab-card__title">{d.title}</h3>
                      <p>{d.text}</p>
                    </div>
                  </Glow>
                );
              })}
              <Glow as="li" seed={5} tone="deep" className="ab-card ab-card--cta">
                <div className="ab-card__body">
                  <h3 className="ab-card__title">Something else?</h3>
                  <p>Most good projects mix a few of these. Tell me what you have in mind.</p>
                  <a href="#say-hello" className="ab-card__go">Get in touch<span className="ab-card__icon" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.4} /></span></a>
                </div>
              </Glow>
            </Reveal>
          </section>

          {/* 04 highlights from the CV */}
          <section id="highlights" className="ab-sec" aria-label="Highlights">
            <p className="ab-label">Highlights</p>
            <h2 className="ab-h2">{highlights.title[0]}<br />{highlights.title[1]}</h2>
            <Reveal as="ol" className="ab-high">
              {highlights.items.map((h, i) => (
                <li key={h.title} style={{ '--i': i } as React.CSSProperties}>
                  <span className="ab-high__n mono" aria-hidden="true">{pad(i + 1)}</span>
                  <b>{h.title}</b>
                  <p>{h.text}</p>
                </li>
              ))}
            </Reveal>
          </section>

          {/* 05 worked with: logos glide past */}
          <section id="clients" className="ab-sec" aria-label="Worked with">
            <p className="ab-label">Worked with</p>
            <h2 className="ab-h2">{clients.title[0]}<br />{clients.title[1]}</h2>
            <LogoRows logos={clients.logos} label="Logos of brands I’ve worked with" />
          </section>

          {/* 06 experience: cards that stack up as you scroll */}
          <section id="experience" className="ab-sec ab-exp" aria-label="Experience">
            <p className="ab-label">Experience</p>
            <Timeline items={experience} />
          </section>

          {/* 07 say hello */}
          <section id="say-hello" className="ab-sec ab-hello-sec" aria-label="Contact">
            <p className="ab-label">Contact</p>
            <h2 className="ab-h2 ab-center">{hello.title[0]}<br />{hello.title[1]}</h2>
            <p className="ab-text ab-center">{hello.text}</p>
            <div className="ab-actions">
              <a className="ab-btn ab-btn--ink" href={`mailto:${site.email}`} data-umami-event="Contact · About email"><Mail size={15} aria-hidden="true" />Email</a>
              <a className="ab-btn" href={wa(phone.wa)} target="_blank" rel="noopener" data-umami-event="Contact · About WhatsApp"><MessageCircle size={15} aria-hidden="true" />WhatsApp</a>
              <a className="ab-btn" href={`tel:${phone.tel}`} data-umami-event="Contact · About call"><Phone size={15} aria-hidden="true" />Call</a>
            </div>
          </section>

        </AboutShell>
      </main>
      <Footer />
      <Effects />
    </>
  );
}
