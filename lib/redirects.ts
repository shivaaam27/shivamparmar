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

/** The new look was tried out under /v2 before it became the site: old /v2 links land on the same page now. */
export const fromV2 = (path: string) => (path === '/v2' || path.startsWith('/v2/') ? path.slice(3) || '/' : null);
