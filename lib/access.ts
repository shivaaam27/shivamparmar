/**
 * Cloudflare Access (Zero Trust, an emailed one-time code) guards /insights and /api/insights in front of the site.
 * This checks the signed token Access adds to every request it lets through (Cf-Access-Jwt-Assertion): signature,
 * audience, issuer, expiry and the one allowed email. Plain web APIs only, so both Next (lib/auth.ts) and the
 * Worker's fast path (worker.ts) use it.
 *
 * Env: ACCESS_TEAM_DOMAIN (e.g. empty-cake-9a98.cloudflareaccess.com), ACCESS_AUD (the Access app's audience tag),
 * INSIGHTS_EMAIL (the only email allowed).
 */

export const accessConfigured = () => Boolean(process.env.ACCESS_TEAM_DOMAIN && process.env.ACCESS_AUD && process.env.INSIGHTS_EMAIL);

type Jwk = JsonWebKey & { kid?: string };
let keys: { at: number; list: Jwk[] } | null = null;
async function key(kid: string) {
  if (!keys || Date.now() - keys.at > 3600e3 || !keys.list.some((k) => k.kid === kid)) {
    const r = await fetch(`https://${process.env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
    keys = { at: Date.now(), list: ((await r.json()) as { keys: Jwk[] }).keys ?? [] };
  }
  return keys.list.find((k) => k.kid === kid) ?? null;
}

const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const json = (s: string) => JSON.parse(new TextDecoder().decode(b64(s)));

/** The allowed email if this request carries a valid Access token, otherwise null. */
export async function accessUser(headers: Headers): Promise<string | null> {
  if (!accessConfigured()) return null;
  const jwt = headers.get('cf-access-jwt-assertion');
  if (!jwt) return null;
  try {
    const [h, p, sig] = jwt.split('.');
    const head = json(h);
    if (head.alg !== 'RS256') return null;
    const jwk = await key(head.kid);
    if (!jwk) return null;
    const k = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', k, b64(sig), new TextEncoder().encode(`${h}.${p}`)))) return null;
    const c = json(p);
    const aud: unknown[] = Array.isArray(c.aud) ? c.aud : [c.aud];
    if (!aud.includes(process.env.ACCESS_AUD) || typeof c.exp !== 'number' || c.exp < Date.now() / 1000) return null;
    if (c.iss && c.iss !== `https://${process.env.ACCESS_TEAM_DOMAIN}`) return null;
    const email = String(c.email ?? '').toLowerCase();
    return email && email === (process.env.INSIGHTS_EMAIL ?? '').trim().toLowerCase() ? email : null;
  } catch {
    return null;
  }
}
