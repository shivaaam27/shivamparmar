/**
 * Visit tracking, sent to two places: Umami (its own script) and this site's
 * own database via /api/collect. Both skip visitors with Do Not Track on, and
 * this device once its owner has opened /insights.
 */
type Umami = { track: (name: string, data?: Record<string, string | number>) => void };

const SESSION_KEY = 'visit.session';
const IDLE = 30 * 60e3; // a new visit starts after 30 idle minutes

function off() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return true;
  if (navigator.doNotTrack === '1') return true;
  try { if (localStorage.getItem('umami.disabled')) return true; } catch { /* storage blocked: still count */ }
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
