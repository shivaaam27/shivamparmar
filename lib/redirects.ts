/**
 * Short addresses that send visitors elsewhere. Used by next.config.ts (next dev) and by worker.ts (the live site, which
 * answers unknown addresses itself before Next runs). Temporary (307), so a target can change without browsers
 * remembering the old one.
 */
export const REDIRECTS: Record<string, string> = {
  // shivolabs.com/get: the Shivo Labs download page (Setup.exe, the one-line install)
  '/get': 'https://shivo-id.ishivamparmar.workers.dev/',
};
