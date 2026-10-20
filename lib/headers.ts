/**
 * Headers on every answer of the site, used by next.config.ts (pages Next answers) and worker.ts (ready-made pages).
 * The Content-Security-Policy lists the only places a page may load from: this site, and Umami and Cloudflare Web
 * Analytics (which Cloudflare adds to every page itself) for visit counts.
 * Scripts and styles inline in the page are allowed because Next writes its page data that way.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.umami.is https://*.umami.dev https://cloudflareinsights.com",
  "frame-ancestors 'none'",   // no other site may show these pages inside its own (fake copies, click tricks)
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const SITE_HEADERS: Record<string, string> = {
  // copyright: ask AI not to train on the photographs (the text may be read and quoted by AI search; see app/robots.ts)
  'X-Robots-Tag': 'noimageai',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
