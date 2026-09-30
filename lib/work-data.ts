import 'server-only';
import { categories, categoryHasWork, hasPage } from './work';
import { imageSize } from './image-size';
import type { Cat } from '@/components/WorkBrowser';

/**
 * Every category with its collections and pictures (with their real sizes), for the work page.
 * Collections without work are left out, unless they're `listed` (shown as "Soon").
 */
export function workData(): Cat[] {
  return categories.filter(categoryHasWork).map((c) => ({
    slug: c.slug,
    name: c.name,
    collections: c.subcategories.filter((sub) => sub.listed || sub.projects.some(hasPage)).map((sub) => {
      const main = sub.projects.find(hasPage);
      return {
        slug: sub.slug,
        name: sub.name,
        page: main ? `/work/${main.slug}` : undefined,
        summary: main?.summary,
        shots: sub.projects.filter(hasPage).flatMap((project) => (project.images ?? []).map((img, i) => {
          const { w, h } = imageSize(img.src);
          return { src: img.src, alt: img.alt, w, h, project: project.title, slug: project.slug, n: i + 1, ...(img.video ? { video: img.video } : {}) };
        })),
      };
    }),
  }));
}
