import { createHmac } from 'node:crypto';
import { db, dbConfigured } from './db';
import { isBot, parseUA } from './ua';
import { visitorPlace, type Cf } from './location';
import { fromServers } from './robots';

/**
 * Records a page view or an action from the site's own tracker into your
 * database. No cookies, and no IP address is stored: a visitor is an
 * anonymous id made from IP + browser + today's date, so the same person
 * can't be followed from one day to the next. Location comes from Cloudflare (lib/location.ts).
 */
// Plain web Request/Response: used by the Next route (next dev) and by worker.ts, which answers it without starting Next.

const ok = () => new Response(null, { status: 204 });
const clip = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null);

export async function collect(req: Request, cf?: Cf): Promise<Response> {
  const host = new URL(req.url).host;
  if (!dbConfigured()) return ok();
  const ua = req.headers.get('user-agent') ?? '';
  if (isBot(ua)) return ok();

  // only accept reports sent from this site's own pages (browsers always send Origin with these; scripts often don't)
  const origin = req.headers.get('origin');
  try { if (!origin || new URL(origin).host !== host) return ok(); } catch { return ok(); }

  const text = await req.text();
  if (text.length > 2000) return ok();
  let body: Record<string, unknown>;
  try { body = JSON.parse(text); } catch { return ok(); }

  const kind = body.type === 'event' ? 'event' : 'pageview';
  const path = clip(body.path, 300);
  const session = clip(body.session, 64);
  if (!path || !path.startsWith('/') || path.startsWith('/insights') || path.startsWith('/api') || !session) return ok();
  const name = kind === 'event' ? clip(body.name, 120) : null;
  if (kind === 'event' && !name) return ok();

  let referrer = clip(body.referrer, 300);
  try { referrer = referrer ? new URL(referrer).host.replace(/^www\./, '') : null; } catch { referrer = null; }
  if (referrer === host.replace(/^www\./, '')) referrer = null;

  const ip = req.headers.get('cf-connecting-ip') || (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || process.env.AUTH_SECRET || 'visits';
  const visitor = createHmac('sha256', salt).update(`${day}|${ip}|${ua}`).digest('base64url').slice(0, 22);

  const place = visitorPlace(req.headers, cf);
  const { device, browser, os } = parseUA(ua);

  try {
    // a reload of the same page in the same visit within 30 minutes isn't another page view
    await db(
      `insert into visits_events (kind, name, path, referrer, country, region, city, device, browser, os, screen, language, visitor, session, asn, network, robot)
       select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
       where $1 <> 'pageview' or not exists (
         select 1 from visits_events
         where session = $14 and path = $3 and kind = 'pageview' and ts > now() - interval '30 minutes'
       )`,
      [kind, name, path, referrer, place.country, place.region, place.city,
        device, browser, os, clip(body.screen, 20), clip(body.language, 20), visitor, session,
        cf?.asn ?? null, clip(cf?.asOrganization, 120), fromServers(cf, clip(body.screen, 20))],
    );
  } catch {
    // never break the page for a failed stat
  }
  return ok();
}
