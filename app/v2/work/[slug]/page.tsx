import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import V2WorkBrowser from '@/components/v2/WorkBrowser';
import ProjectWall from '@/components/v2/ProjectWall';
import { imageSize } from '@/lib/image-size';
import V2WorkIndex from '@/components/v2/WorkIndex';
import { ProjectOpen, ProjectNav } from '@/components/v2/ProjectScene';
import LiveSite from '@/components/v2/LiveSite';
import { Cta } from '@/components/v2/Kit';
import { site } from '@/lib/content';
import { SHOW_PROJECT_LINKS, categories, findCategory, findProject, pagedProjects, type Category } from '@/lib/work';
import { workData } from '@/lib/work-data';
import { reelEntries } from '@/lib/work-reel';
import { tc } from '@/lib/v2';

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
  const entries = reelEntries(category.slug);
  return (
    <main id="main" className="v2-page v2-work-film">
      <V2WorkIndex entries={entries} title={['My', category.name]} lead={`${category.name}, made in Tanzania.`}>
        <V2WorkBrowser cats={workData()} initial={{ c: category.slug, s: null }} archive />
        <Cta />
      </V2WorkIndex>
    </main>
  );
}

/**
 * A project: its picture or recording full screen (morphing in from the work page), the information sliding up over
 * it; the rest of its pictures (the one already shown full screen is not repeated; a day / night recording stays, as
 * its slider). The previous project, all work and the next come straight after the information, before the pictures.
 */
function ProjectPage({ slug }: { slug: string }) {
  const entry = findProject(slug);
  if (!entry) notFound();
  const { sub, project } = entry;
  const all = reelEntries();
  const at = all.findIndex((e) => e.slug === project.slug);
  const e = all[at];
  const prev = all.length > 1 ? all[(at - 1 + all.length) % all.length] : null;
  const next = all.length > 1 ? all[(at + 1) % all.length] : null;
  const facts = [
    sub.name !== project.title && { label: 'Collection', value: tc(sub.name) },
    project.year && { label: 'Year', value: project.year },
    project.role && { label: 'Role', value: project.role },
    project.tools?.length && { label: 'Tools', value: project.tools.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];
  const link = project.link && (SHOW_PROJECT_LINKS || project.link.always) ? project.link : null;
  const shots = (project.images ?? []).map((img) => ({ ...img, ...imageSize(img.src), project: project.title, slug: project.slug }));
  const lead = Math.max(0, shots.findIndex((s) => s.src === e.cover));
  const rest = shots.filter((s, i) => i !== lead || s.compare);

  return (
    <main id="main" className="v2-page v2-project">
      <ProjectOpen e={e} index={at} total={all.length} facts={facts} details={project.details} shots={shots} lead={lead}>
        {link && (
          <p className="v2-po__live v2-po__rise">
            <LiveSite href={link.href} label={link.label} title={tc(project.title)} embed={link.embed} />
            {link.title && <span className="v2-po__host">{link.title}</span>}
          </p>
        )}
      </ProjectOpen>

      <ProjectNav prev={prev && { slug: prev.slug, title: prev.title }} next={next && { slug: next.slug, title: next.title }} />
      {rest.length > 0 && (
        <section className="v2-gallery" aria-label="Pictures">
          <ProjectWall shots={rest} />
        </section>
      )}
      <Cta />
    </main>
  );
}
