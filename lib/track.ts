/**
 * Visit tracking, sent to two places: Umami (its own script) and this site's
 * own database via /api/collect. Both skip visitors with Do Not Track on, and
 * a browser once its owner has opened /insights or the link shivolabs.com/?notrack
 * (?track counts it again). The link is for browsers that never open /insights,
 * like the ones inside Instagram, LinkedIn and WhatsApp.
 */
type Umami = { track: (name: string, data?: Record<string, string | number>) => void };

const SESSION_KEY = 'visit.session';
const IDLE = 30 * 60e3; // a new visit starts after 30 idle minutes
const OFF_KEY = 'umami.disabled'; // Umami's own switch, so both stop together

/** Reads ?notrack / ?track once, before anything is sent; returns what changed for a short note. */
export const optOutChange: 'off' | 'on' | null = (() => {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const change = q.has('notrack') ? 'off' : q.has('track') ? 'on' : null;
  if (!change) return null;
  try { if (change === 'off') localStorage.setItem(OFF_KEY, '1'); else localStorage.removeItem(OFF_KEY); } catch { return null; }
  return change;
})();

function off() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return true;
  if (navigator.doNotTrack === '1') return true;
  try { if (localStorage.getItem(OFF_KEY)) return true; } catch { /* storage blocked: still count */ }
  return window.location.pathname.startsWith('/insights');
}

function session() {
  const now = Date.now();
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as { id: string; at: number } | null;
    const id = saved && now - saved.at < IDLE ? saved.id : crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, at: now }));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** One report to /api/collect; sendBeacon survives the page closing. */
export function collect(type: 'pageview' | 'event', name?: string) {
  if (off()) return;
  const body = JSON.stringify({
    type, name,
    path: window.location.pathname,
    referrer: type === 'pageview' ? document.referrer : undefined,
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    session: session(),
  });
  const sent = navigator.sendBeacon?.('/api/collect', new Blob([body], { type: 'application/json' }));
  if (!sent) fetch('/api/collect', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
}

/**
 * Record an action. Names carry their detail ("Filter · Photography › Portraits")
 * so each shows up as its own row in the dashboard.
 */
export function track(name: string, data?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { umami?: Umami }).umami?.track(name, data);
  collect('event', name);
}
