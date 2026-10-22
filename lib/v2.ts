/**
 * Version 2 of the site lives under /v2 while both versions are compared (docs/V2-PLAN.md).
 * Every V2 link goes through v2(), so making V2 the site is one change here: return the path unchanged.
 */
export const V2_BASE = '/v2';

/** '/work' → '/v2/work', '/#contact' → '/v2#contact', 'mailto:…' and 'https://…' stay as they are. */
export function v2(path: string): string {
  if (!path.startsWith('/')) return path;
  if (path === '/' || path.startsWith('/#') || path.startsWith('/?')) return `${V2_BASE}${path.slice(1)}`;
  return `${V2_BASE}${path}`;
}

/** The same page in the other version: '/about' ↔ '/v2/about'. `rest` is the query and #hash, kept as they are. */
export function otherVersion(pathname: string, rest = ''): string {
  if (pathname === V2_BASE || pathname.startsWith(`${V2_BASE}/`)) return (pathname.slice(V2_BASE.length) || '/') + rest;
  return v2(pathname) + rest;
}

export const isV2Path = (pathname: string) => pathname === V2_BASE || pathname.startsWith(`${V2_BASE}/`);

/** Little words that stay lowercase inside a title (English and Kiswahili), unless first or last. */
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'over', 'per', 'the', 'to', 'via', 'vs', 'with',
  'na', 'ya', 'wa', 'za', 'kwa', 'la', 'cha', 'vya', 'mwa',
  'es']);   // Dar es Salaam

/**
 * Title Case for headings and short descriptions in V2: 'digital services for businesses' → 'Digital Services for Businesses'.
 * Words that already carry a capital inside (iPhone, MCP, CocoZuri) are left as they are.
 * `start: false` continues a title that began in an earlier piece (its first word is not capitalized for being first).
 */
export function tc(text: string, { start = true }: { start?: boolean } = {}): string {
  const words = text.split(/(\s+)/);
  const real = words.map((w, i) => (/\S/.test(w) ? i : -1)).filter((i) => i >= 0);
  const last = real[real.length - 1];
  let prev = '';
  return words.map((w, i) => {
    if (!/\S/.test(w)) return w;
    const isFirst = i === real[0] && start;
    const afterBreak = /[:.?!—]$/.test(prev);
    prev = w;
    const m = w.match(/^([^\p{L}\p{N}]*)(\p{L})(.*)$/u);
    if (!m) return w;
    const [, lead, ch, rest] = m;
    if (/\p{Lu}/u.test(rest)) return w;                           // iPhone, MCP, CocoZuri
    const core = (ch + rest).toLowerCase().replace(/[^\p{L}]+$/u, '');
    if (SMALL.has(core) && !isFirst && !afterBreak && i !== last) return lead + ch.toLowerCase() + rest;
    return lead + ch.toUpperCase() + rest;
  }).join('');
}
