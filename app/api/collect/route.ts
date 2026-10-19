import { getCloudflareContext } from '@opennextjs/cloudflare';
import { collect } from '@/lib/collect';

/** The site's own visit tracker (lib/collect.ts). On Cloudflare, worker.ts answers it directly; this route is for next dev. */
export async function POST(req: Request) {
  let cf;
  try { cf = getCloudflareContext().cf; } catch { /* next dev */ }
  return collect(req, cf as never);
}
