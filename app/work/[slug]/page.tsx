import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import WorkBrowser from '@/components/WorkBrowser';
import { site } from '@/lib/content';
import { categories, findCategory, findProject, pagedProjects, type Category } from '@/lib/work';
import { workData } from '@/lib/work-data';

type Props = { params: Promise<{ slug: string }> };

/** /work/<slug> is either a category's full page or a project's page. */
export const dynamicParams = false;
export function generateStaticParams() {
  const projects = pagedProjects().map(({ project }) => project.slug);
  const clash = categories.find((c) => projects.includes(c.slug));
  if (clash) throw new Error(`"${clash.slug}" is both a category and a project slug; rename one in lib/work.ts`);
  return [...categories.map((c) => c.slug), ...projects].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const category = findCategory(slug);
  if (category) return {
    title: `${category.name} — ${site.fullName}`,
    description: `${category.name} by Shivam Parmar: ${category.subcategories.filter((s) => s.projects.some((p) => p.images?.length)).map((s) => s.name).join(", ")}.`,
    alternates: { canonical: `/work/${category.slug}` },
    openGraph: { url: `/work/${category.slug}`, title: `${category.name} — ${site.fullName}` },
  };
  const entry = findProject(slug);
  if (!entry) return {};
  const { project } = entry;
  return {
    title: `${project.title} — ${site.fullName}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { url: `/work/${project.slug}`, title: `${project.title} — ${site.fullName}`, description: project.summary, ...(project.images?.[0] ? { images: [project.images[0].src] } : {}) },
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default async function WorkPage({ params }: Props) {
  const slug = (await params).slug;
  const category = findCategory(slug);
  return category ? <CategoryPage category={category} /> : <ProjectPage slug={slug} />;
}

/* ---------- a category: the work page, opened on it ---------- */

function CategoryPage({ category }: { category: Category }) {
  return (
    <>
      <Header />
      <main id="main" className="page work-page">
        <section className="section work-page__body" aria-label={category.name}>
          <WorkBrowser cats={workData()} initial={{ c: category.slug, s: null }} />
        </section>
      </main>
      <Footer />
      <Effects />
    </>
  );
}

/* ---------- a project ---------- */

function ProjectPage({ slug }: { slug: string }) {
  const entry = findProject(slug);
  if (!entry) notFound();
  const { category, sub, project } = entry;

  const all = pagedProjects();
  const at = all.findIndex((e) => e.project.slug === project.slug);
  // with only two projects, previous and next are the same one, so show just next
  const prev = all.length > 2 ? all[(at - 1 + all.length) % all.length] : null;
  const next = all.length > 1 ? all[(at + 1) % all.length] : null;

  const details = [
    project.year && { label: 'Year', value: project.year },
    project.role && { label: 'Role', value: project.role },
    project.tools?.length && { label: 'Tools', value: project.tools.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <Header />
      <main id="main" className="page project">
        <section className="section project__intro">
          <nav className="project__crumbs mono reveal" aria-label="Breadcrumb">
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work/${category.slug}`}>{category.name}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work/${category.slug}?s=${sub.slug}`}>{sub.name}</Link>
          </nav>
          <h1 className="headline headline--left reveal" data-delay="1">{project.title}</h1>
          {project.summary && <p className="lead project__summary reveal" data-delay="2">{project.summary}</p>}
          {details.length > 0 && (
            <dl className="project__details reveal" data-delay="3">
              {details.map((d) => (
                <div key={d.label}><dt className="mono">{d.label}</dt><dd>{d.value}</dd></div>
              ))}
            </dl>
          )}
        </section>

        <section className="section project__gallery" aria-label="Images">
          {project.images?.map((img, i) => (
            <figure key={img.src} id={`photo-${i + 1}`} className="project__figure reveal">
              {img.video
                ? <video src={img.video} poster={img.src} controls controlsList="nodownload noremoteplayback" disablePictureInPicture playsInline loop preload="none" aria-label={img.alt} />
                : <img src={img.src} alt={img.alt} loading={i === 0 ? 'eager' : 'lazy'} />}
              <figcaption className="mono">
                <span>{pad(i + 1)}</span>{img.caption ?? img.alt}
              </figcaption>
            </figure>
          ))}
        </section>

        {(prev || next) && (
          <nav className="section project__pager" aria-label="More work">
            {prev && (
              <Link href={`/work/${prev.project.slug}`} className="project__pager-link">
                <span className="mono">← Previous</span>{prev.project.title}
              </Link>
            )}
            {next && (
              <Link href={`/work/${next.project.slug}`} className="project__pager-link project__pager-link--next">
                <span className="mono">Next →</span>{next.project.title}
              </Link>
            )}
          </nav>
        )}
      </main>
      <Footer />
      <Effects />
    </>
  );
}
