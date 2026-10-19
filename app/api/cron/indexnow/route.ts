import { NextResponse, type NextRequest } from 'next/server';
import { INDEXNOW_KEY, publicPaths, siteUrl } from '@/lib/seo';

/**
 * Tells Bing and the other IndexNow search engines about every public page,
 * once a day (Cloudflare cron trigger, see wrangler.jsonc and worker.ts), so new work shows up there quickly. Google doesn't
 * use IndexNow; it finds the site through links and the sitemap.
 * Only a request that carries CRON_SECRET may run it (the Cloudflare scheduler sends it).
 */
function allowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get('authorization') === `Bearer ${secret}`;
  return (req.headers.get('user-agent') ?? '').startsWith('vercel-cron');
}

export async function GET(req: NextRequest) {
  if (!allowed(req)) return new NextResponse('Not found', { status: 404 });
  const url = siteUrl();
  if (url.startsWith('http://localhost')) return NextResponse.json({ skipped: 'no public address' });
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(url).host,
      key: INDEXNOW_KEY,
      keyLocation: `${url}/${INDEXNOW_KEY}.txt`,
      urlList: publicPaths().map(({ path }) => `${url}${path === '/' ? '' : path}`),
    }),
  });
  return NextResponse.json({ status: res.status, sent: publicPaths().length });
}
