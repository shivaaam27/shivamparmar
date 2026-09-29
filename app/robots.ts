import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

/** /robots.txt: read everything except the private dashboard and the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/insights', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
