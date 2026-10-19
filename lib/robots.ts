/**
 * Is this visit from a data centre rather than a person? Robots that run a real browser (search engines, link
 * previews, scanners) pass the user-agent check in lib/ua.ts, but they come from server networks, which Cloudflare
 * names on every request (request.cf.asn / asOrganization). People come from phone and home networks.
 * Visits that look like robots are still saved (robot = true) and counted separately, never thrown away.
 */

// Networks of the big clouds and hosting companies (AS numbers). Cloudflare's own (13335) is left out on purpose:
// people using its WARP app come from it.
const SERVER_ASNS = new Set([
  16509, 14618, 8987,            // Amazon (AWS)
  15169, 396982, 19527, 36040,   // Google, Google Cloud
  8075, 8068, 8069,              // Microsoft (Azure, Bing)
  32934, 63293,                  // Meta (Facebook, WhatsApp link previews)
  714, 6185,                     // Apple (Applebot, link previews)
  14061, 16276, 24940, 63949, 31898, 45102, 132203, 51167, 20473, 60781, 12876, 9009, 60068, 46606, 62567, 202425,
  //  DigitalOcean, OVH, Hetzner, Linode, Oracle, Alibaba, Tencent, Contabo, Vultr, Leaseweb, Scaleway, M247, Datacamp,
  //  Unified Layer, DigitalOcean (2), IP Volume
]);
const SERVER_NAMES = /amazon|aws|google|microsoft|azure|facebook|meta platforms|apple inc|digitalocean|ovh|hetzner|linode|akamai connected cloud|oracle|alibaba|tencent|contabo|vultr|choopa|leaseweb|scaleway|m247|datacamp|hosting|data ?cent(er|re)|server|colocation|cloud(?!flare)/i;

export type Network = { asn?: number; asOrganization?: string };

export function fromServers(cf?: Network): boolean {
  if (!cf) return false;
  if (cf.asn && SERVER_ASNS.has(cf.asn)) return true;
  return Boolean(cf.asOrganization && SERVER_NAMES.test(cf.asOrganization));
}
