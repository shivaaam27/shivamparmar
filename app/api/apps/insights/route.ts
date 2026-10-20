import { appsInsightsJson } from '@/lib/apps-insights';

/** The Shivo Labs apps' numbers (lib/apps-insights.ts), key only. On Cloudflare, worker.ts answers this without Next. */
export async function GET(req: Request) {
  return appsInsightsJson(req);
}
