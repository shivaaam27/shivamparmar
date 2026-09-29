import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Camera, LayoutDashboard, Mail, MessageCircle, PenTool, Phone, Pill, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import AboutShell from '@/components/about/AboutShell';
import CountUp from '@/components/about/CountUp';
import { aboutPage, nav, site } from '@/lib/content';
import { pagedProjects, visibleCategories } from '@/lib/work';
import './about.css';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: aboutPage.intro[0],
};

const pad = (n: number) => String(n).padStart(2, '0');
const ICONS = [LayoutDashboard, Sparkles, PenTool, Camera, Pill];
const wa = (n: string) => `https://wa.me/${n}`;

export default function AboutPage() {
  const { sections, headline, eyebrow, intro, disciplines, clients, experience, hello, ending } = aboutPage;
  const projects = pagedProjects();
  const photo = visibleCategories().find((c) => c.slug === 'photography');
  const photos = projects.filter((p) => p.category.slug === 'photography').reduce((n, p) => n + (p.project.images?.length ?? 0), 0);
  const stats = [
    { value: projects.length, label: 'Projects on this site' },
    { value: photo?.subcategories.length ?? 0, label: 'Photo collections' },
    { value: photos, label: 'Photographs' },
    { value: disciplines.length, label: 'Disciplines, one way of working' },
  ];
  const [phone] = site.phones;

  // 07 index: the whole site on one page, full width at the end
  const endingPanel = (
    <section id="index" className="ab-sec ab-end" aria-label="Index">
      <div className="ab-end__art">
        <div className="ab-end__caption">
          <p><b>{ending.greeting}</b><br />{ending.line}</p>
        </div>
      </div>
      <div className="ab-end__body">
        <div className="ab-end__top">
          <p><b>Got a question?</b><a href={`mailto:${site.email}`}>Get in touch</a></p>
          <p><b>Quicker on the phone?</b><a href={wa(phone.wa)} target="_blank" rel="noopener">WhatsApp me</a></p>
          <p><b>See what I make</b><Link href="/work">Browse the work</Link></p>
        </div>
        <div className="ab-end__lists">
          <div>
            <p className="ab-end__h">Work</p>
            <ul className="ab-end__list">
        {projects.map(({ project, category }) => (
          <li key={project.slug}><Link href={`/work/${project.slug}`}>{project.title}</Link><span>{category.name}</span></li>
        ))}
            </ul>
          </div>
          <div>
            <p className="ab-end__h">Disciplines</p>
            <ul className="ab-end__list">
        {disciplines.map((d) => <li key={d.title}><a href="#services">{d.title}</a></li>)}
            </ul>
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
          <section id="numbers" className="ab-sec" aria-label="In numbers">
            <p className="ab-label">In numbers</p>
            <ul className="ab-stats">
              {stats.map((s) => (
                <li key={s.label}><b><CountUp to={s.value} /></b><span>{s.label}</span></li>
              ))}
            </ul>
            <p className="ab-text">{intro[1]}</p>
          </section>

          {/* 03 what I do */}
          <section id="services" className="ab-sec" aria-label="What I do">
            <p className="ab-label">What I do</p>
            <h2 className="ab-h2">Five disciplines,<br />one way of working.</h2>
            <ul className="ab-cards">
              {disciplines.map((d, i) => {
                const Icon = ICONS[i] ?? Sparkles;
                return (
                  <li key={d.title} className="ab-card">
                    <span className="ab-card__icon" aria-hidden="true"><Icon size={18} strokeWidth={1.5} /></span>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </li>
                );
              })}
              <li className="ab-card ab-card--cta">
                <h3>Something else?</h3>
                <p>Most good projects mix a few of these. Tell me what you have in mind.</p>
                <a href="#say-hello" className="ab-link mono">Say hello<span aria-hidden="true"> ↓</span></a>
              </li>
            </ul>
          </section>

          {/* 04 worked with: logos glide past */}
          <section id="clients" className="ab-sec" aria-label="Worked with">
            <p className="ab-label">Worked with</p>
            <h2 className="ab-h2 ab-center">{clients.title[0]}<br />{clients.title[1]}</h2>
            <div className="ab-logos" aria-label="Logos of brands I’ve worked with">
              {[0, 1].map((row) => (
                <div key={row} className={`ab-marquee${row ? ' ab-marquee--back' : ''}`}>
                  <ul className="ab-marquee__track">
                    {[...clients.logos, ...clients.logos].map((l, i) => (
                      <li key={i} aria-hidden={row > 0 || i >= clients.logos.length}>
                        {l.src ? <img src={l.src} alt={l.name} /> : <span className="ab-logo-ph">{l.name}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 05 experience: compact rows */}
          <section id="experience" className="ab-sec" aria-label="Experience">
            <p className="ab-label">Experience</p>
            <ol className="ab-rows">
              {experience.map((r, i) => (
                <li key={i}>
                  <span className="ab-rows__years">{r.years}</span>
                  <span className="ab-rows__role"><b>{r.role}</b><em>{r.place}</em></span>
                  <span className="ab-rows__text">{r.text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 06 say hello */}
          <section id="say-hello" className="ab-sec ab-hello-sec" aria-label="Say hello">
            <p className="ab-label">Say hello</p>
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
