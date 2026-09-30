import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

/** Crawlers that collect images to train AI models. They may read the pages, but not the photographs. */
const AI_TRAINING = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent', 'cohere-training-data-crawler', 'Omgilibot'];

/** /robots.txt: read everything except the private dashboard and the API; AI trainers also skip the images. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/insights', '/api/'] },
      { userAgent: AI_TRAINING, allow: '/', disallow: ['/images/', '/insights', '/api/'] },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
