/**
 * Short addresses that send visitors elsewhere. Used by next.config.ts (next dev) and by worker.ts (the live site, which
 * answers unknown addresses itself before Next runs). Temporary (307), so a target can change without browsers
 * remembering the old one.
 */
export const REDIRECTS: Record<string, string> = {
  // shivolabs.com/get: the Shivo Labs download page (Setup.exe, the one-line install, the Android app; phones get Android first)
  '/get': 'https://shivo-id.ishivamparmar.workers.dev/',
  // the products and the services are part of About now
  '/products': '/about#products',
  '/services': '/about#services',
};

/** Pages that no longer exist: their address moves for good (301) to the page that carries the content now. */
export const MOVED: Record<string, string> = {
  '/faq': '/contact#faq',
  '/sw/maswali': '/contact#faq',
  '/sw/huduma': '/about#services',
  '/services/:slug': '/about#services',
  '/sw/huduma/:slug': '/about#services',
};
/** Where a removed page's address goes now, or null. */
export const movedTo = (path: string): string | null => {
  if (MOVED[path]) return MOVED[path];
  return /^\/(services|sw\/huduma)\/[^/]+$/.test(path) ? '/about#services' : null;
};

/** The new look was tried out under /v2 before it became the site: old /v2 links land on the same page now. */
export const fromV2 = (path: string) => (path === '/v2' || path.startsWith('/v2/') ? path.slice(3) || '/' : null);
