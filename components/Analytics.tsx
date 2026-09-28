'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/** Umami website ID (public: it's in every page's source). An env var can override it. */
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'c8e39f81-6be1-4b1b-a492-801b885b6347';
/** Optional: only count visits on these hosts (e.g. "shivamparmar.com"), so previews don't. */
const DOMAINS = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

/**
 * Umami page-view tracking: cookieless, respects Do Not Track, live site
 * only, and never on the private /insights pages.
 */
export default function Analytics() {
  const path = usePathname();
  if (!WEBSITE_ID || process.env.NODE_ENV !== 'production' || path?.startsWith('/insights')) return null;
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={WEBSITE_ID}
      data-do-not-track="true"
      {...(DOMAINS ? { 'data-domains': DOMAINS } : {})}
      strategy="afterInteractive"
    />
  );
}
