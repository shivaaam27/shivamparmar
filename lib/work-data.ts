import 'server-only';
import { hasPage, visibleCategories } from './work';
import { imageSize } from './image-size';
import type { Cat } from '@/components/WorkBrowser';

/** Every category with its collections and pictures (with their real sizes), for the work page. */
export function workData(): Cat[] {
  return visibleCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
    collections: c.subcategories.map((sub) => {
      const main = sub.projects.find(hasPage);
      return {
        slug: sub.slug,
        name: sub.name,
        page: main ? `/work/${main.slug}` : undefined,
        summary: main?.summary,
        shots: sub.projects.flatMap((project) => (project.images ?? []).map((img, i) => {
          const { w, h } = imageSize(img.src);
          return { src: img.src, alt: img.alt, w, h, project: project.title, slug: project.slug, n: i + 1 };
        })),
      };
    }),
  }));
}
