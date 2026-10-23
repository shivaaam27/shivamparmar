/**
 * The words typed on the pages, kept in content/site-text.json so they can be changed without touching code
 * (npm run text:edit opens a small page on this computer to do it). Each item has a key, a label saying what it is,
 * and its words. In a text, [[words in double brackets]] are shown in bold, full colour.
 */
import data from '@/content/site-text.json';

type Value = string | string[];
const map = new Map<string, Value>();
for (const g of data.groups) for (const i of g.items) map.set(i.key, i.value as Value);

/** The words for a key, as one string. */
export function copy(key: string, fallback = ''): string {
  const v = map.get(key);
  const s = Array.isArray(v) ? v.join(' ') : v;
  return s && s.trim() ? s : fallback;
}

/** The words for a key, one entry per line. */
export function copyLines(key: string, fallback: string[] = []): string[] {
  const v = map.get(key);
  const out = (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).map((x) => x.trim()).filter(Boolean);
  return out.length ? out : fallback;
}

/** A text split at its [[marked]] words: { t: the words, hl: true when marked }. */
export function parts(text: string): { t: string; hl: boolean }[] {
  const out: { t: string; hl: boolean }[] = [];
  text.split(/(\[\[.+?\]\])/g).forEach((seg) => {
    if (!seg) return;
    const m = seg.match(/^\[\[(.+?)\]\]$/);
    out.push(m ? { t: m[1], hl: true } : { t: seg, hl: false });
  });
  return out;
}

/** The text without its [[marks]]. */
export const plain = (text: string) => text.replace(/\[\[|\]\]/g, '');
