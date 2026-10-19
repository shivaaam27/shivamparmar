import { findCategory, findProject } from './work';
import type { ListKey, Row } from './insights-shared';

/** Human labels for the raw values Umami reports. Shared by the dashboard (in the browser) and the CSV export. */

/** Region names (TZ-02 -> Dar es Salaam), from public/geo/regions.json; set once they are loaded. */
let REGIONS: Record<string, string> = {};
export const setRegionNames = (names: Record<string, string>) => { REGIONS = names; };
export const regionName = (code: string) => REGIONS[code.toUpperCase()] || code.split('-')[1] || code;

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const safe = (fn: () => string | undefined, fallback: string) => { try { return fn() || fallback; } catch { return fallback; } };

export const countryName = (code: string) => (code ? safe(() => regionNames.of(code.toUpperCase()), code) : 'Unknown');

const BROWSERS: Record<string, string> = {
  chrome: 'Chrome', crios: 'Chrome (iOS)', ios: 'Safari (iOS)', 'ios-webview': 'In-app (iOS)', safari: 'Safari',
  'edge-chromium': 'Edge', edge: 'Edge', firefox: 'Firefox', fxios: 'Firefox (iOS)', samsung: 'Samsung Internet',
  opera: 'Opera', 'chromium-webview': 'In-app (Android)', facebook: 'Facebook app', instagram: 'Instagram app', yandexbrowser: 'Yandex',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function pageLabel(path: string) {
  const clean = path.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';
  if (clean === '/') return 'Home';
  if (clean === '/work') return 'Work';
  if (clean.startsWith('/about')) return 'About';
  const m = clean.match(/^\/work\/([^/]+)/);
  if (m) {
    const slug = m[1];
    const name = findProject(slug)?.project.title ?? findCategory(slug)?.name ?? OLD_SLUGS[slug] ?? titleCase(slug);
    return `Work · ${name}`;
  }
  return clean;
}

/** Pages that were renamed; visits from before still show under the old address. */
const OLD_SLUGS: Record<string, string> = { 'fabra-labs': 'Shivo Labs (old address)' };
const titleCase = (slug: string) => slug.split('-').map(cap).join(' ');

export function label(list: ListKey, raw: string): string {
  switch (list) {
    case 'pages':
    case 'entries': return pageLabel(raw);
    case 'referrers': return raw ? raw.replace(/^www\./, '') : 'Direct or unknown';
    case 'countries': return countryName(raw);
    case 'regions': {
      const [c, r] = raw.split('-');
      if (!r) return raw || 'Unknown';
      return `${REGIONS[raw.toUpperCase()] || r} · ${countryName(c)}`;
    }
    case 'cities': return raw || 'Unknown';
    case 'devices': return raw ? cap(raw) : 'Unknown';
    case 'browsers': return BROWSERS[raw] ?? (raw ? cap(raw) : 'Unknown');
    case 'languages': return raw ? safe(() => languageNames.of(raw), raw) : 'Unknown';
    case 'screens': return raw ? raw.replace('x', ' × ') : 'Unknown';
    default: return raw || 'Unknown';
  }
}

export const labelled = (list: ListKey, rows: Row[]): Row[] => rows.map((r) => ({ label: label(list, r.label), value: r.value }));

/* numbers */
export const fmt = (n: number) => new Intl.NumberFormat('en', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);
export const pct = (n: number) => `${Math.round(n * 100)}%`;
export function duration(sec: number) {
  if (!sec) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

/** What each list's number counts (Umami counts pages as views and actions as events). */
export const unitOf = (list: ListKey) => (list === 'pages' || list === 'entries' ? 'Views' : list === 'events' ? 'Times' : 'Visitors');

export function toCsv(list: ListKey, rows: Row[], header: string) {
  const esc = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [[header, unitOf(list)].map(esc).join(','), ...rows.map((r) => [esc(r.label), esc(r.value)].join(','))].join('\n');
}
