import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import V2WorkBrowser from '@/components/v2/WorkBrowser';
import ProjectGallery from '@/components/v2/ProjectGallery';
import { imageSize } from '@/lib/image-size';
import { Cta, PageHero } from '@/components/v2/Kit';
import { ArrowUR } from '@/components/v2/Art';
import { site } from '@/lib/content';
import { SHOW_PROJECT_LINKS, categories, findCategory, findProject, pagedProjects, coverOf, type Category } from '@/lib/work';
import { workData } from '@/lib/work-data';
import { tc, v2 } from '@/lib/v2';

type Props = { params: Promise<{ slug: string }> };

/** /v2/work/<slug> is either a category's full page or a project's page (as V1). */
export const dynamicParams = false;
export function generateStaticParams() {
  return [...categories.map((c) => c.slug), ...pagedProjects().map(({ project }) => project.slug)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const category = findCategory(slug);
  if (category) return { title: `${category.name} — ${site.fullName}`, alternates: { canonical: `/work/${category.slug}` } };
  const entry = findProject(slug);
  if (!entry) return {};
  return { title: `${entry.project.title} — ${site.fullName}`, description: entry.project.summary, alternates: { canonical: `/work/${entry.project.slug}` } };
}


export default async function WorkSlugV2({ params }: Props) {
  const slug = (await params).slug;
  const category = findCategory(slug);
  return category ? <CategoryPage category={category} /> : <ProjectPage slug={slug} />;
}

function CategoryPage({ category }: { category: Category }) {
  return (
    <main id="main" className="v2-page">
      <V2WorkBrowser cats={workData()} initial={{ c: category.slug, s: null }} />
      <Cta />
    </main>
  );
}

const TONES = ['lime', 'sky', 'sun', 'clay', 'mint'];

function ProjectPage({ slug }: { slug: string }) {
  const entry = findProject(slug);
  if (!entry) notFound();
  const { category, sub, project } = entry;
  const all = pagedProjects();
  const at = all.findIndex((e) => e.project.slug === project.slug);
  const prev = all.length > 2 ? all[(at - 1 + all.length) % all.length] : null;
  const next = all.length > 1 ? all[(at + 1) % all.length] : null;
  const details = [
    project.year && { label: 'Year', value: project.year },
    project.role && { label: 'Role', value: project.role },
    project.tools?.length && { label: 'Tools', value: project.tools.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];
  const showLink = project.link && (SHOW_PROJECT_LINKS || project.link.always);

  return (
    <main id="main" className="v2-page v2-project">
      <PageHero tone="forest" tag={category.name} title={tc(project.title)} lead={project.summary}
        crumbs={[{ href: v2('/work'), label: 'Work' }, { href: v2(`/work/${category.slug}`), label: category.name }, { href: `${v2(`/work/${category.slug}`)}?s=${sub.slug}`, label: sub.name }]}>
        <span className="v2-pill v2-pill--lime">{project.images?.length ?? 0} {project.images?.some((i) => i.video) ? 'pictures and videos' : 'pictures'}</span>
        {details.map((d) => <span key={d.label} className="v2-pill">{d.label}: {d.value}</span>)}
        {showLink && <a className="v2-pill" href={project.link!.href} title={project.link!.title} target="_blank" rel="noopener">{project.link!.label} <ArrowUR size={12} /></a>}
      </PageHero>

      <section className="v2-gallery" aria-label="Images">
        <div className="v2-wrap">
          <ProjectGallery shots={(project.images ?? []).map((img) => ({ ...img, ...imageSize(img.src), project: project.title, slug: project.slug }))} />
        </div>
      </section>

      {(prev || next) && (
        <nav className="v2-sec v2-sec--tight v2-pager" aria-label="More work">
          <div className="v2-wrap v2-pager__in" data-reveal>
            {[prev, next].map((e, k) => e && (
              <Link key={k} href={v2(`/work/${e.project.slug}`)} className={`v2-card v2-card--${TONES[(at + k) % TONES.length]} v2-pager__card v2-grow${k ? ' is-next' : ''}`}>
                {coverOf(e.project) && <span className="v2-pager__img"><img src={coverOf(e.project)} alt="" loading="lazy" /></span>}
                <span className="v2-pager__txt">
                  <span className="v2-label">{k ? `Next · ${e.category.name}` : `Previous · ${e.category.name}`}</span>
                  <b>{tc(e.project.title)}</b>
                </span>
                <span className="v2-pager__go" aria-hidden="true">{k ? '→' : '←'}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
      <Cta />
    </main>
  );
}
