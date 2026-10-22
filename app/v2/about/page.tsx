import type { Metadata } from 'next';
import Link from 'next/link';
import { aboutPage, nav, site } from '@/lib/content';
import { pagedProjects, visibleCategories } from '@/lib/work';
import { tc, v2 } from '@/lib/v2';
import { Cta, Page, pad } from '@/components/v2/Kit';
import { V2Clients } from '@/components/v2/Home';
import V2Disciplines from '@/components/v2/Disciplines';
import V2Journey from '@/components/v2/Journey';
import Count from '@/components/v2/Count';
import Ribbons from '@/components/v2/Ribbons';
import { Kicker } from '@/components/v2/Ui';
import { ArrowUR, Burst, Leaf } from '@/components/v2/Art';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: 'About Shivam Parmar, who runs Shivo Labs, a freelance software and digital solutions business in Dar es Salaam: pharmacist (BPharm, MSc Pharmacovigilance), photographer and systems builder.',
  alternates: { canonical: '/about' },
};

const wa = (n: string) => `https://wa.me/${n}`;

/** V2 /about, laid out like a magazine profile: cover, numbers and facts, what I do, highlights, logos, the journey, contact, index. */
export default function AboutV2() {
  const { headline, eyebrow, intro, facts, disciplines, highlights, experience, ending } = aboutPage;
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
  const byType = Object.values(projects.reduce((m, { category }) => {
    (m[category.slug] ??= { slug: category.slug, name: category.name, n: 0 }).n += 1;
    return m;
  }, {} as Record<string, { slug: string; name: string; n: number }>));
  const [hi, name] = headline[0].split(/,\s*/);

  return (
    <Page cta={false} className="v2-aboutp">
      {/* the cover */}
      <section className="v2-ahero v2-dark" data-reveal>
        <Ribbons set="page" />
        <div className="v2-wrap v2-ahero__in">
          <div className="v2-ahero__text">
            <Kicker n="—">About</Kicker>
            <h1 className="v2-h1 v2-ahero__title v2-rise">{hi}, <em>{name}</em></h1>
            <p className="v2-ahero__eyebrow v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{eyebrow.split(' · ').map((e) => tc(e)).join(' · ')}</p>
            <p className="v2-lead v2-ahero__lead v2-rise" style={{ '--d': 2 } as React.CSSProperties}>{intro[0]}</p>
            <div className="v2-ahero__actions v2-rise" style={{ '--d': 3 } as React.CSSProperties}>
              <Link className="v2-btn v2-btn--lime" href={v2('/work')}>See the work<span className="v2-btn__dot"><ArrowUR /></span></Link>
              <a className="v2-more" href={`mailto:${site.email}`} data-umami-event="Contact · V2 About email">Email me <ArrowUR /></a>
            </div>
          </div>
          <figure className="v2-ahero__art v2-grow" style={{ '--d': 2 } as React.CSSProperties}>
            <div className="v2-ahero__ph v2-ahero__ph--main"><img src="/images/about-design.jpg" alt="" /></div>
            <div className="v2-ahero__ph v2-ahero__ph--round"><img src="/images/mikumi-giraffe.jpg" alt="" /></div>
            <Burst className="v2-ahero__sun v2-spin" points={16} />
            <Leaf className="v2-ahero__leaf v2-sway" />
          </figure>
        </div>
      </section>

      {/* at a glance */}
      <section className="v2-sec v2-glance" id="numbers" aria-label="At a glance" data-reveal>
        <div className="v2-wrap">
          <Kicker n={1}>At a glance</Kicker>
          <div className="v2-glance__body">
            <div className="v2-glance__left">
              <blockquote className="v2-quote v2-rise"><p>{intro[1]}</p></blockquote>
              <ul className="v2-glance__stats">
                {stats.map((s, i) => (
                  <li key={s.label} className="v2-rise" style={{ '--d': i } as React.CSSProperties}>
                    <b><Count value={s.value} /></b>
                    <span>{tc(s.label)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="v2-facts v2-rise" style={{ '--d': 1 } as React.CSSProperties} aria-label="Quick facts">
              {facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>

      {/* what I do */}
      <div id="services"><V2Disciplines n={2} /></div>

      {/* highlights: each card has its own moving line */}
      <section className="v2-sec v2-high-sec" id="highlights" aria-label="Highlights" data-reveal>
        <div className="v2-wrap">
          <Kicker n={3}>Highlights</Kicker>
          <h2 className="v2-h2 v2-high__head v2-rise">{tc(highlights.title[0])} <em>{tc(highlights.title[1], { start: false })}</em></h2>
          <ol className="v2-high">
            {highlights.items.map((h, i) => (
              <li key={h.title} className="v2-high__item v2-rise" style={{ '--d': i % 4 } as React.CSSProperties}>
                <div className="v2-high__art"><Ribbons set={`h${i + 1}`} /></div>
                <span className="v2-high__n">{pad(i + 1)}</span>
                <b className="v2-high__title">{tc(h.title)}</b>
                <p className="v2-high__text">{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* worked with */}
      <div id="clients" className="v2-clients-wrap"><V2Clients /></div>

      {/* the journey */}
      <V2Journey items={experience} n={5} />

      {/* say hello */}
      <div id="say-hello"><Cta /></div>

      {/* index */}
      <section id="index" className="v2-sec v2-sec--tight v2-aindex" aria-label="Index" data-reveal>
        <div className="v2-wrap">
          <Kicker n={6}>Index</Kicker>
          <div className="v2-aindex__card">
            <div className="v2-aindex__top">
              <div className="v2-aindex__hi">
                <h2 className="v2-h2 v2-rise">{ending.greeting.split(',')[0]}, <em>{ending.greeting.split(',').slice(1).join(',').trim()}</em></h2>
                <p className="v2-lead v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{ending.line}</p>
                <div className="v2-aindex__actions v2-rise" style={{ '--d': 2 } as React.CSSProperties}>
                  <a className="v2-btn v2-btn--lime" href={`mailto:${site.email}?subject=New%20project`} data-umami-event="Contact · V2 About start project">{ending.cta}<span className="v2-btn__dot"><ArrowUR /></span></a>
                  <a className="v2-more" href={wa(phone.wa)} target="_blank" rel="noopener">WhatsApp {phone.label} <ArrowUR /></a>
                </div>
              </div>
              <figure className="v2-aindex__photo v2-grow" style={{ '--d': 1 } as React.CSSProperties}>
                <img src={ending.photo} alt="" loading="lazy" />
                <Burst className="v2-aindex__sun v2-spin" points={14} />
              </figure>
            </div>
            <div className="v2-aindex__groups">
              <div className="v2-aindex__group"><p className="v2-label">Work by type</p><ul>{byType.map((c) => <li key={c.slug}><Link href={v2(`/work/${c.slug}`)}>{tc(c.name)}<sup>{c.n}</sup></Link></li>)}</ul></div>
              <div className="v2-aindex__group"><p className="v2-label">Disciplines</p><ul>{disciplines.map((d) => <li key={d.title}><a href="#services">{tc(d.title)}</a></li>)}</ul></div>
              <div className="v2-aindex__group"><p className="v2-label">Pages</p><ul>{nav.map((n) => <li key={n.href}><Link href={v2(n.href)}>{n.label}</Link></li>)}</ul></div>
              <div className="v2-aindex__group"><p className="v2-label">Contact</p><ul>
                <li><a href={`mailto:${site.email}`}>Email</a></li>
                <li><a href={`tel:${phone.tel}`}>Call</a></li>
                <li><a href={wa(phone.wa)} target="_blank" rel="noopener">WhatsApp</a></li>
                <li><span>{site.location}</span></li>
              </ul></div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
