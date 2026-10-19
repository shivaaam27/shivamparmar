import type { MetadataRoute } from 'next';
import { publicPaths, siteUrl } from '@/lib/seo';
import { posts } from '@/lib/journal';

/** /sitemap.xml: every public page, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  const now = new Date();
  const pages = publicPaths().map(({ path, priority }) => ({ url: `${url}${path === '/' ? '' : path}`, lastModified: now, changeFrequency: 'monthly' as const, priority }));
  const journal = posts().map((p) => ({ url: `${url}/journal/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'yearly' as const, priority: 0.7 }));
  return [...pages, ...journal];
}
