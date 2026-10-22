import { categories, coverOf, pagedProjects } from './work';
import { imageSize } from './image-size';
import type { ReelEntry } from '@/components/v2/WorkIndex';

/** The V2 reel's projects (components/v2/WorkIndex.tsx), in site order, optionally for one category. */
export function reelEntries(categorySlug?: string): ReelEntry[] {
  return pagedProjects()
    .filter((e) => !categorySlug || e.category.slug === categorySlug)
    .map(({ category, sub, project }) => {
      const imgs = project.images ?? [];
      // a website's walkthrough plays in its panel; a project of photos shows its cover
      const lead = imgs.find((i) => i.video && i.screen) ?? null;
      const cover = lead?.src ?? coverOf(project) ?? '';
      // a screen capture is shown from its top; a photograph from its middle
      const screen = !!(imgs.find((i) => i.src === cover)?.screen ?? (imgs.length > 0 && imgs.every((i) => i.screen)));
      return {
        slug: project.slug, title: project.title, category: category.name, categorySlug: category.slug, collection: sub.name,
        summary: project.summary, cover, coverW: cover ? imageSize(cover).w : undefined, coverH: cover ? imageSize(cover).h : undefined, screen, video: lead?.video,
        pictures: imgs.filter((i) => !i.video).length, videos: imgs.filter((i) => i.video).length,
      };
    });
}

/** A category with more projects than this is one tile on the main work page (it opens the category's own page). */
const ONE_TILE_OVER = 5;

/**
 * The tiles of V2's work page: on a category's page, each of its projects; on the main page, each project of a small
 * category (websites, systems...) and one tile for a big one (photography), so the wall stays short.
 */
export function wallEntries(categorySlug?: string): ReelEntry[] {
  const all = reelEntries(categorySlug);
  if (categorySlug) return all;
  return categories.flatMap((c) => {
    const own = all.filter((e) => e.categorySlug === c.slug);
    if (own.length <= ONE_TILE_OVER) return own;
    const lead = own.find((e) => e.cover === c.cover) ?? own[0];
    const cover = c.cover ?? lead.cover;
    return [{
      ...lead, slug: `category-${c.slug}`, href: `/work/${c.slug}`, title: c.name, collection: c.name, screen: false, video: undefined,
      cover, coverW: imageSize(cover).w, coverH: imageSize(cover).h, count: own.length,
      pictures: own.reduce((n, e) => n + e.pictures, 0), videos: own.reduce((n, e) => n + e.videos, 0),
    }];
  });
}
