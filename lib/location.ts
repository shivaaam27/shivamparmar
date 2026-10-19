import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Where a visitor is, from the host's own headers. Cloudflare gives country, region and city
 * (request.cf); the Vercel headers are still read so the site also works there.
 */
export type Place = { country: string | null; region: string | null; city: string | null };

const decode = (v: string | null | undefined) => {
  if (!v) return null;
  try { return decodeURIComponent(v); } catch { return v; }
};

export function visitorPlace(headers: Headers): Place {
  let cf: { country?: string; regionCode?: string; city?: string } | undefined;
  try { cf = getCloudflareContext().cf as typeof cf; } catch { /* not running on Cloudflare (next dev, tests) */ }

  const country = cf?.country || headers.get('cf-ipcountry') || decode(headers.get('x-vercel-ip-country'));
  const regionCode = cf?.regionCode || decode(headers.get('x-vercel-ip-country-region'));
  const city = cf?.city || decode(headers.get('x-vercel-ip-city'));
  const known = country && country !== 'XX' && country !== 'T1';   // Cloudflare's "unknown" and "Tor"
  return {
    country: known ? country : null,
    region: known && regionCode ? `${country}-${regionCode}` : null,
    city: known ? city || null : null,
  };
}
