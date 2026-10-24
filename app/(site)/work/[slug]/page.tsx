import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import V2WorkBrowser from '@/components/site/WorkBrowser';
import ProjectWall from '@/components/site/ProjectWall';
import { imageSize } from '@/lib/image-size';
import V2WorkIndex from '@/components/site/WorkIndex';
import { ProjectOpen, ProjectNav } from '@/components/site/ProjectScene';
import LiveSite from '@/components/site/LiveSite';
import { Cta } from '@/components/site/Kit';
import { site } from '@/lib/content';
import { SHOW_PROJECT_LINKS, categories, findCategory, findProject, pagedProjects, type Category } from '@/lib/work';
import { workData } from '@/lib/work-data';
import { reelEntries } from '@/lib/work-reel';
import { tc } from '@/lib/title-case';

type Props = { params: Promise<{ slug: string }> };

/** /work/<slug> is either a category's full page or a project's page. */
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


export default async function WorkSlugPage({ params }: Props) {
  const slug = (await params).slug;
  const category = findCategory(slug);
  return category ? <CategoryPage category={category} /> : <ProjectPage slug={slug} />;
}

function CategoryPage({ category }: { category: Category }) {
  const entries = reelEntries(category.slug);
  // a category of words only has no pictures for the wall: the green band and its list stand alone
  if (!entries.length) {
    return (
      <main id="main" className="v2-page v3">
        <V2WorkBrowser cats={workData()} initial={{ c: category.slug, s: null }} />
        <Cta />
      </main>
    );
  }
  return (
    <main id="main" className="v2-page v2-work-film v3">
      <V2WorkIndex entries={entries} title={category.name}>
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
    <main id="main" className="v2-page v2-project v3">
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
