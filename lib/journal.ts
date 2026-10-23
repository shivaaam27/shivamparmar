import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { isPostLang, POST_LANGS, type PostLang } from './post-lang';

/**
 * The Journal: one Markdown file per post in content/journal (my-post.md). Read when the site is built, so every
 * post becomes a ready-made page (/journal/<slug>) and lands in the sitemap, the RSS feed, llms.txt and the nightly
 * IndexNow ping by itself. Each file starts with a small header:
 *
 *   ---
 *   title: What does your business in Tanzania actually need?
 *   description: One or two sentences for Google and for sharing.
 *   date: 2026-10-20
 *   lang: en              (en, sw, fr, ar, hi or gu)
 *   tags: websites, systems
 *   pair: biashara-yako-inahitaji-nini   (optional: the same post in another language; one slug, or several separated
 *                                         by commas. A post and all its translations form one group, so it is enough
 *                                         that each translation names the English post.)
 *   draft: true           (optional: kept off the site until removed)
 *   ---
 */

export type Post = {
  slug: string; title: string; description: string; date: string; lang: PostLang; tags: string[];
  /** the other posts in the group: this post in the other languages */
  translations: string[];
  /** the group's name: the English post's slug, else the first slug; the same for a post and all its translations */
  group: string;
  html: string; words: number;
  /** the post's sections (its ## headings), for the "In this article" list; each heading in `html` has the same id */
  toc: { id: string; text: string }[];
};

/** Gives every section heading an id the contents list can link to. */
function withIds(html: string) {
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
    let id = text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

const DIR = join(process.cwd(), 'content', 'journal');

type Parsed = Omit<Post, 'translations' | 'group'> & { pairs: string[] };

function parse(file: string): Parsed | null {
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
    lang: isPostLang(meta.lang) ? meta.lang : 'en',
    tags: (meta.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    pairs: (meta.pair ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    ...withIds(marked.parse(body, { async: false }) as string),
    words: body.split(/\s+/).length,
  };
}

let cache: Post[] | null = null;
/** Every published post, newest first. */
export function posts(): Post[] {
  if (cache) return cache;
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { /* no posts yet */ }
  const all = files.map(parse).filter((p): p is Parsed => Boolean(p));

  // a post and its translations form a group: any post that names another joins them
  const parent = new Map(all.map((p) => [p.slug, p.slug]));
  const root = (s: string): string => { while (parent.get(s) !== s) s = parent.get(s)!; return s; };
  for (const p of all) for (const q of p.pairs) if (parent.has(q)) parent.set(root(q), root(p.slug));
  const members = new Map<string, Parsed[]>();
  for (const p of all) { const r = root(p.slug); members.set(r, [...(members.get(r) ?? []), p]); }

  cache = all.map(({ pairs: _pairs, ...p }) => {
    const mine = members.get(root(p.slug)) ?? [];
    const lead = mine.find((x) => x.lang === 'en') ?? [...mine].sort((a, b) => a.slug.localeCompare(b.slug))[0];
    return { ...p, translations: mine.filter((x) => x.slug !== p.slug).map((x) => x.slug), group: lead.slug };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return cache;
}
export const findPost = (slug: string) => posts().find((p) => p.slug === slug);
/** A post and its translations, one per language, English first: for the language button and for hreflang. */
export function versionsOf(p: Post): Post[] {
  const all = [p, ...p.translations.map(findPost).filter((x): x is Post => Boolean(x))];
  return POST_LANGS.flatMap((l) => { const x = all.find((y) => y.lang === l && y === p) ?? all.find((y) => y.lang === l); return x ? [x] : []; });
}
export const readingTime = (p: Post) => Math.max(1, Math.round(p.words / 220));
