import type { MetadataRoute } from 'next';
import { publicPaths, siteUrl } from '@/lib/seo';
import { posts, versionsOf } from '@/lib/journal';
import { HREFLANG } from '@/lib/post-lang';

/** /sitemap.xml: every public page, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  const now = new Date();
  const pages = publicPaths().map(({ path, priority }) => ({ url: `${url}${path === '/' ? '' : path}`, lastModified: now, changeFrequency: 'monthly' as const, priority }));
  const journal = posts().map((p) => {
    // a post that exists in several languages lists them all, so search engines know they are the same post
    const v = versionsOf(p);
    const languages = v.length > 1 ? Object.fromEntries(v.map((x) => [HREFLANG[x.lang], `${url}/journal/${x.slug}`])) : undefined;
    return { url: `${url}/journal/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'yearly' as const, priority: 0.7, ...(languages ? { alternates: { languages } } : {}) };
  });
  return [...pages, ...journal];
}
