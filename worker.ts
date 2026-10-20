// The site's Cloudflare entry point.
//  1. Pages Next made ahead of time (all of the public site) are handed out as plain files from the Worker's static
//     files (scripts/static-pages.mjs puts them there). That costs about no computer time, which keeps the site inside
//     Cloudflare's free plan (10 ms per request); running Next for the same page costs 20–200 ms.
//  2. The requests that come all the time are answered here directly, without Next: the visit tracker (/api/collect),
//     the dashboard's numbers (/api/insights/data, after checking the Cloudflare Access sign-in), the Shivo Labs apps'
//     numbers (/api/apps/insights, with the apps' key) and the nightly jobs.
//  3. Everything else (CSV export, sign-in callbacks, unknown pages) goes to Next through OpenNext's worker. It is
//     loaded only when such a request comes, so the paths above never pay for starting Next (20–200 ms).
// @ts-ignore .open-next/static-pages.json is created after `next build`, by scripts/static-pages.mjs
import STATIC from './.open-next/static-pages.json';
import { collect } from './lib/collect';
import { accessUser } from './lib/access';
import { insightsJson } from './lib/insights-api';
import { appsInsightsJson } from './lib/apps-insights';
import { indexNow, umamiBackup } from './lib/jobs';
import { SITE_HEADERS } from './lib/headers';

type Page = { kind: 'page' | 'file'; headers: Record<string, string>; segments?: string[]; status?: number };
type Env = {
  ASSETS: { fetch(req: Request | URL): Promise<Response> }; CRON_SECRET?: string; SITE_URL?: string;
  COLLECT_LIMIT?: { limit(o: { key: string }): Promise<{ success: boolean }> };
};
type CfRequest = Request & { cf?: { country?: string; regionCode?: string; city?: string } };
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException?(): void };
type Next = { fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> };

const pages = STATIC as Record<string, Page>;
// @ts-ignore .open-next/worker.js is created by `opennextjs-cloudflare build`
const next = (): Promise<Next> => import('./.open-next/worker.js').then((m) => m.default);

// Same schedule as wrangler.jsonc "triggers.crons" -> which page it runs
const JOBS: Record<string, () => Promise<unknown>> = {
  '30 1 * * *': umamiBackup,
  '15 3 * * *': () => indexNow(Object.entries(pages).filter(([p, v]) => v.kind === 'page' && !p.startsWith('/insights')).map(([p]) => p)),
};


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
  async fetch(req: CfRequest, env: Env, ctx: Ctx) {
    // one address for search engines: www.shivolabs.com forwards to shivolabs.com, keeping the path
    const host = new URL(req.url).hostname;
    if (host.startsWith('www.')) { const to = new URL(req.url); to.hostname = host.slice(4); return Response.redirect(to.toString(), 301); }
    const file = await fromFile(req, env).catch(() => null);
    if (file) return file;
    const url = new URL(req.url);
    if (url.pathname === '/api/collect' && req.method === 'POST') {
      // more than 30 reports a minute from one address is someone filling the stats: answer as usual, save nothing
      const ip = req.headers.get('cf-connecting-ip') ?? '';
      const within = await env.COLLECT_LIMIT?.limit({ key: ip }).then((r) => r.success).catch(() => true);
      return within === false ? new Response(null, { status: 204 }) : collect(req, req.cf);
    }
    if (url.pathname === '/api/insights/data' && req.method === 'GET') {
      const user = await accessUser(req.headers);
      if (!user) return new Response('Not found', { status: 404 });
      // the same numbers for 45 seconds: the dashboard asks every minute, and a reload or a range switch back
      // shouldn't redo the work (only after the sign-in check above, and never shared with anyone else)
      const key = new Request(`https://cache.shivolabs.internal/insights${url.search}`);
      const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
      const hit = await cache.match(key).catch(() => undefined);
      if (hit && !url.searchParams.has('fresh')) return new Response(hit.body, { headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } });
      const res = await insightsJson(url, user);
      if (res.ok) ctx.waitUntil(cache.put(key, new Response(res.clone().body, { headers: { 'content-type': 'application/json', 'cache-control': 'max-age=45' } })).catch(() => undefined));
      return res;
    }
    // the Shivo Labs apps' Insights (through the shelf, with the site's key; lib/apps-insights.ts)
    if (url.pathname === '/api/apps/insights' && req.method === 'GET') return appsInsightsJson(req);
    if (!url.pathname.startsWith('/api/') && (req.method === 'GET' || req.method === 'HEAD') && !req.headers.get('rsc')) {
      // an address that isn't a page (bots try many): the ready-made 'not found' page, without starting Next
      const res = await env.ASSETS.fetch(new URL('/__static/_404/page.html', url)).catch(() => null);
      if (res?.ok) return new Response(req.method === 'HEAD' ? null : res.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', ...SITE_HEADERS } });
    }
    return (await next()).fetch(req, env, ctx);
  },
  async scheduled(event: { cron: string }, _env: Env, ctx: Ctx) {
    const job = JOBS[event.cron];
    if (job) ctx.waitUntil(job().then((r) => console.log(event.cron, JSON.stringify(r))));
  },
};
