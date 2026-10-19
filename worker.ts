// The site's Cloudflare entry point.
//  1. Pages Next made ahead of time (all of the public site) are handed out as plain files from the Worker's static
//     files (scripts/static-pages.mjs puts them there). That costs about no computer time, which keeps the site inside
//     Cloudflare's free plan (10 ms per request); running Next for the same page costs 20–200 ms.
//  2. Everything else (/insights, /api, the nightly jobs) goes to Next through OpenNext's worker. It is loaded only
//     when such a request comes, so serving a file never pays for starting Next.
// @ts-expect-error .open-next/static-pages.json is created by scripts/static-pages.mjs
import STATIC from './.open-next/static-pages.json';

type Page = { kind: 'page' | 'file'; headers: Record<string, string>; segments?: string[]; status?: number };
type Env = { ASSETS: { fetch(req: Request | URL): Promise<Response> }; CRON_SECRET?: string; SITE_URL?: string };
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException?(): void };
type Next = { fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> };

const pages = STATIC as Record<string, Page>;
// @ts-expect-error .open-next/worker.js is created by `opennextjs-cloudflare build`
const next = (): Promise<Next> => import('./.open-next/worker.js').then((m) => m.default);

// Same schedule as wrangler.jsonc "triggers.crons" -> which page it runs
const JOBS: Record<string, string> = {
  '30 1 * * *': '/api/cron/umami-backup',
  '15 3 * * *': '/api/cron/indexnow',
};

// the site-wide headers from next.config.ts, which Next would have added
const SITE_HEADERS: Record<string, string> = { 'X-Robots-Tag': 'noai, noimageai' };

/** The ready-made answer for this request, or null when Next has to answer it. */
async function fromFile(req: Request, env: Env): Promise<Response | null> {
  if (req.method !== 'GET' && req.method !== 'HEAD') return null;
  const url = new URL(req.url);
  let path: string;
  try { path = decodeURIComponent(url.pathname); } catch { return null; }
  if (path.length > 1) path = path.replace(/\/+$/, '');
  const page = pages[path];
  if (!page) return null;
  const base = `/__static/${path === '/' ? 'index' : path.slice(1)}`;

  let file: string, type: string;
  if (page.kind === 'file') {
    file = `${base}/body`;
    type = page.headers['content-type'] ?? 'application/octet-stream';
  } else if (req.headers.get('rsc') === '1') {
    // Next asking for page data (clicking a link) or for prefetched pieces of it (links on screen)
    const segment = req.headers.get('next-router-segment-prefetch');
    if (segment && !page.segments?.includes(segment)) return null;
    file = segment ? `${base}/seg${segment}.rsc` : `${base}/page.rsc`;
    type = 'text/x-component';
  } else {
    file = `${base}/page.html`;
    type = 'text/html; charset=utf-8';
  }

  const res = await env.ASSETS.fetch(new URL(file, url));
  if (!res.ok) return null;
  const headers = new Headers({ ...page.headers, ...SITE_HEADERS, 'content-type': type });
  if (page.kind === 'page') {
    headers.set('cache-control', 'public, max-age=0, must-revalidate');
    headers.set('vary', 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch');
  }
  headers.delete('x-next-cache-tags');
  return new Response(req.method === 'HEAD' ? null : res.body, { status: page.status ?? 200, headers });
}

export default {
  async fetch(req: Request, env: Env, ctx: Ctx) {
    const file = await fromFile(req, env).catch(() => null);
    if (file) return file;
    return (await next()).fetch(req, env, ctx);
  },
  async scheduled(event: { cron: string }, env: Env, ctx: Ctx) {
    const path = JOBS[event.cron];
    if (!path || !env.CRON_SECRET) return; // the routes only answer a request that carries CRON_SECRET
    const base = env.SITE_URL || 'https://shivolabs.com';
    const handler = await next();
    ctx.waitUntil(handler.fetch(new Request(`${base}${path}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } }), env, ctx));
  },
};
