import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

/**
 * AI that answers questions (ChatGPT search, Claude, Perplexity, Copilot, Gemini through Google) is welcome to read
 * and quote every page: that is how people asking an AI find Shivo Labs. AI that collects material to train models may
 * read the text too, but never the photographs (they are Shivam's, see scripts/copyright.py).
 */
const AI_ANSWERS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'DuckAssistBot', 'MistralAI-User'];
const AI_TRAINING = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent', 'cohere-training-data-crawler', 'Omgilibot'];
const PRIVATE = ['/insights', '/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_ANSWERS, allow: '/', disallow: PRIVATE },
      { userAgent: AI_TRAINING, allow: '/', disallow: ['/images/', ...PRIVATE] },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
