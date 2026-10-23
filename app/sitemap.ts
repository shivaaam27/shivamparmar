import type { MetadataRoute } from 'next';
import { publicPaths, siteUrl } from '@/lib/seo';
import { posts } from '@/lib/journal';

/** /sitemap.xml: every public page, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  const now = new Date();
  const pages = publicPaths().map(({ path, priority }) => ({ url: `${url}${path === '/' ? '' : path}`, lastModified: now, changeFrequency: 'monthly' as const, priority }));
  const all = posts();
  const journal = all.map((p) => {
    // a post that exists in two languages lists both, so search engines know they are the same post
    const twin = p.pair ? all.find((x) => x.slug === p.pair) : undefined;
    const languages = twin ? Object.fromEntries([p, twin].map((x) => [x.lang, `${url}/journal/${x.slug}`])) : undefined;
    return { url: `${url}/journal/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'yearly' as const, priority: 0.7, ...(languages ? { alternates: { languages } } : {}) };
  });
  return [...pages, ...journal];
}
