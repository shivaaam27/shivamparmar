// The site's Cloudflare entry point: OpenNext's generated worker, plus the two nightly jobs.
// @ts-expect-error .open-next/worker.js is created by `opennextjs-cloudflare build`
import handler from './.open-next/worker.js';

// Same schedule as wrangler.jsonc "triggers.crons" -> which page it runs
const JOBS: Record<string, string> = {
  '30 1 * * *': '/api/cron/umami-backup',
  '15 3 * * *': '/api/cron/indexnow',
};

type Env = { CRON_SECRET?: string; SITE_URL?: string };

export default {
  fetch: handler.fetch,
  async scheduled(event: { cron: string }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const path = JOBS[event.cron];
    if (!path || !env.CRON_SECRET) return; // the routes only answer a request that carries CRON_SECRET
    const base = env.SITE_URL || 'https://shivolabs.com';
    ctx.waitUntil(handler.fetch(new Request(`${base}${path}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } }), env, ctx));
  },
};

// Pass through anything else the generated worker exports (Durable Object classes, if a cache is added later)
// @ts-expect-error see above
export * from './.open-next/worker.js';
