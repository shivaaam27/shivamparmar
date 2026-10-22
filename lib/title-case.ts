/** Title Case for headings and short descriptions (English and Kiswahili). */
/** Little words that stay lowercase inside a title (English and Kiswahili), unless first or last. */
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'over', 'per', 'the', 'to', 'via', 'vs', 'with',
  'na', 'ya', 'wa', 'za', 'kwa', 'la', 'cha', 'vya', 'mwa',
  'es']);   // Dar es Salaam

/**
 * Title Case for headings and short descriptions: 'digital services for businesses' → 'Digital Services for Businesses'.
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
