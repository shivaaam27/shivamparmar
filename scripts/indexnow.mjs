// After a deploy: tells Bing and the other IndexNow search engines (they feed ChatGPT search and Copilot) about every page
// in the live sitemap, so changes show up there within hours instead of at the nightly run. Google doesn't use IndexNow.
// Run: node scripts/indexnow.mjs [site]   (npm run cf:deploy runs it by itself; a failure never fails the deploy)
const site = (process.argv[2] || process.env.SITE_URL || 'https://shivolabs.com').replace(/\/$/, '');
const KEY = '6322fb909f2bf56c2a9f3a5be9cd87c8'; // same as INDEXNOW_KEY in lib/seo.ts, served at /<key>.txt

try {
  const xml = await (await fetch(`${site}/sitemap.xml`, { cache: 'no-store' })).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!urls.length) throw new Error('the sitemap has no pages');
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site).host, key: KEY, keyLocation: `${site}/${KEY}.txt`, urlList: urls }),
  });
  // 200 and 202 both mean received
  console.log(res.ok ? `IndexNow: sent ${urls.length} pages (${res.status})` : `IndexNow: answered ${res.status} ${await res.text()}`);
} catch (e) {
  console.log(`IndexNow: not sent (${e.message})`);
}
