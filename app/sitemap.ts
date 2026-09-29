import type { MetadataRoute } from 'next';
import { publicPaths, siteUrl } from '@/lib/seo';

/** /sitemap.xml: every public page, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  const now = new Date();
  return publicPaths().map(({ path, priority }) => ({ url: `${url}${path === '/' ? '' : path}`, lastModified: now, changeFrequency: 'monthly', priority }));
}
