// After `opennextjs-cloudflare build`: copies every page Next made ahead of time (all of the public site) into the
// Worker's static files, so worker.ts can hand them out without starting Next at all. Serving a file costs about no
// computer time; running Next for the same page costs 20–200 ms, far over the free plan's 10 ms per request.
//
//   .open-next/assets/__static/<page>/page.html       the page
//   .open-next/assets/__static/<page>/page.rsc        the data Next fetches when you click to this page
//   .open-next/assets/__static/<page>/seg/<x>.rsc     the pieces Next prefetches for links on screen
//   .open-next/assets/__static/<page>/body            a file route (sitemap.xml, robots.txt, llms.txt, icons)
//   .open-next/static-pages.json                      the list worker.ts reads
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, '.next', 'server', 'app');
const out = join(root, '.open-next', 'assets', '__static');
const manifest = JSON.parse(readFileSync(join(root, '.next', 'prerender-manifest.json'), 'utf8'));

// pages that must always run live (data, sign-in) or are Next's own error pages. /insights is a file too: it holds no
// numbers, Cloudflare Access guards it, and its data comes from /api/insights/data.
const LIVE = [/^\/api\//, /^\/_/];

const pages = {};
const copy = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); };
for (const [route, info] of Object.entries(manifest.routes)) {
  if (LIVE.some((r) => r.test(route)) || info.initialRevalidateSeconds !== false) continue;
  const base = route === '/' ? 'index' : route.slice(1);
  const dest = join(out, base);
  const metaFile = join(app, `${base}.meta`);
  const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};
  const headers = meta.headers ?? {};
  if (existsSync(join(app, `${base}.html`))) {
    copy(join(app, `${base}.html`), join(dest, 'page.html'));
    if (existsSync(join(app, `${base}.rsc`))) copy(join(app, `${base}.rsc`), join(dest, 'page.rsc'));
    const segments = (meta.segmentPaths ?? []).filter((s) => existsSync(join(app, `${base}.segments${s}.segment.rsc`)));
    for (const s of segments) copy(join(app, `${base}.segments${s}.segment.rsc`), join(dest, 'seg', `${s}.rsc`));
    pages[route] = { kind: 'page', headers, segments };
  } else if (existsSync(join(app, `${base}.body`))) {
    copy(join(app, `${base}.body`), join(dest, 'body'));
    pages[route] = { kind: 'file', headers, status: meta.status ?? 200 };
  }
}
// the 'not found' page, for every unknown address (bots try many), so those never start Next either
if (existsSync(join(app, '_not-found.html'))) copy(join(app, '_not-found.html'), join(out, '_404', 'page.html'));
writeFileSync(join(root, '.open-next', 'static-pages.json'), JSON.stringify(pages));
console.log(`static pages: ${Object.values(pages).filter((p) => p.kind === 'page').length} pages, ${Object.values(pages).filter((p) => p.kind === 'file').length} files`);
