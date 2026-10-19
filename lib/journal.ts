import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import type { Lang } from './services';

/**
 * The Journal: one Markdown file per post in content/journal (my-post.md). Read when the site is built, so every
 * post becomes a ready-made page (/journal/<slug>) and lands in the sitemap, the RSS feed, llms.txt and the nightly
 * IndexNow ping by itself. Each file starts with a small header:
 *
 *   ---
 *   title: What does your business in Tanzania actually need?
 *   description: One or two sentences for Google and for sharing.
 *   date: 2026-10-20
 *   lang: en              (en or sw)
 *   tags: websites, systems
 *   pair: biashara-yako-inahitaji-nini   (optional: the same post in the other language)
 *   draft: true           (optional: kept off the site until removed)
 *   ---
 */

export type Post = {
  slug: string; title: string; description: string; date: string; lang: Lang; tags: string[]; pair?: string;
  html: string; words: number;
};

const DIR = join(process.cwd(), 'content', 'journal');

function parse(file: string): Post | null {
  const text = readFileSync(join(DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  if (meta.draft === 'true' || !meta.title || !meta.date) return null;
  const body = m[2].trim();
  return {
    slug: file.replace(/\.md$/, ''),
    title: meta.title,
    description: meta.description ?? '',
    date: meta.date,
    lang: meta.lang === 'sw' ? 'sw' : 'en',
    tags: (meta.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    pair: meta.pair || undefined,
    html: marked.parse(body, { async: false }) as string,
    words: body.split(/\s+/).length,
  };
}

let cache: Post[] | null = null;
/** Every published post, newest first. */
export function posts(): Post[] {
  if (cache) return cache;
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { /* no posts yet */ }
  cache = files.map(parse).filter((p): p is Post => Boolean(p)).sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}
export const findPost = (slug: string) => posts().find((p) => p.slug === slug);
export const readingTime = (p: Post) => Math.max(1, Math.round(p.words / 220));
