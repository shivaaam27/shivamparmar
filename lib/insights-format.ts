import { findProject } from './work';
import type { ListKey, Row } from './umami';

/** Human labels for the raw values Umami reports. Shared by the page and the CSV export. */

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
  if (path === '/' || path === '') return 'Home';
  const m = path.match(/^\/work\/([^/?#]+)/);
  if (m) return `Work · ${findProject(m[1])?.project.title ?? m[1]}`;
  if (path.startsWith('/about')) return 'About';
  return path;
}

export function label(list: ListKey, raw: string): string {
  switch (list) {
    case 'pages':
    case 'entries': return pageLabel(raw);
    case 'referrers': return raw ? raw.replace(/^www\./, '') : 'Direct or unknown';
    case 'countries': return countryName(raw);
    case 'regions': {
      const [c, r] = raw.split('-');
      return r ? `${r} · ${countryName(c)}` : raw || 'Unknown';
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
