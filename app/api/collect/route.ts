import { createHmac } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { db, dbConfigured } from '@/lib/db';
import { isBot, parseUA } from '@/lib/ua';

/**
 * Records a page view or an action from the site's own tracker into your
 * database. No cookies, and no IP address is stored: a visitor is an
 * anonymous id made from IP + browser + today's date, so the same person
 * can't be followed from one day to the next. Location comes from Vercel.
 */

const ok = () => new NextResponse(null, { status: 204 });
const clip = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null);
const header = (req: NextRequest, k: string) => {
  const v = req.headers.get(k);
  if (!v) return null;
  try { return decodeURIComponent(v); } catch { return v; }
};

export async function POST(req: NextRequest) {
  if (!dbConfigured()) return ok();
  const ua = req.headers.get('user-agent') ?? '';
  if (isBot(ua)) return ok();

  // only accept reports sent from this site's own pages
  const origin = req.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).host !== req.nextUrl.host) return ok(); } catch { return ok(); }
  }

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
  if (referrer === req.nextUrl.host.replace(/^www\./, '')) referrer = null;

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || process.env.AUTH_SECRET || 'visits';
  const visitor = createHmac('sha256', salt).update(`${day}|${ip}|${ua}`).digest('base64url').slice(0, 22);

  const country = header(req, 'x-vercel-ip-country');
  const regionCode = header(req, 'x-vercel-ip-country-region');
  const { device, browser, os } = parseUA(ua);

  try {
    // a reload of the same page in the same visit within 30 minutes isn't another page view
    await db(
      `insert into visits_events (kind, name, path, referrer, country, region, city, device, browser, os, screen, language, visitor, session)
       select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
       where $1 <> 'pageview' or not exists (
         select 1 from visits_events
         where session = $14 and path = $3 and kind = 'pageview' and ts > now() - interval '30 minutes'
       )`,
      [kind, name, path, referrer, country, country && regionCode ? `${country}-${regionCode}` : null, header(req, 'x-vercel-ip-city'),
        device, browser, os, clip(body.screen, 20), clip(body.language, 20), visitor, session],
    );
  } catch {
    // never break the page for a failed stat
  }
  return ok();
}
