'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { collect } from '@/lib/track';

/** Umami website ID (public: it's in every page's source). An env var can override it. */
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'c8e39f81-6be1-4b1b-a492-801b885b6347';
/** Optional: only count visits on these hosts (e.g. "shivamparmar.com"), so previews don't. */
const DOMAINS = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

/**
 * Visit tracking: Umami's script, plus the site's own recorder (page views
 * on every navigation, and clicks on anything marked data-umami-event).
 * Cookieless, respects Do Not Track, live site only, never on /insights.
 */
export default function Analytics() {
  const path = usePathname();

  useEffect(() => {
    if (!path?.startsWith('/insights')) collect('pageview');
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-umami-event]');
      const name = el?.getAttribute('data-umami-event');
      if (name) collect('event', name);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!WEBSITE_ID || process.env.NODE_ENV !== 'production' || path?.startsWith('/insights')) return null;
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={WEBSITE_ID}
      data-do-not-track="true"
      // filters and in-page links change ?c=… and #…; count those as the same page
      data-exclude-search="true"
      data-exclude-hash="true"
      {...(DOMAINS ? { 'data-domains': DOMAINS } : {})}
      strategy="afterInteractive"
    />
  );
}
