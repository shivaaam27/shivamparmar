import 'server-only';
import { headers } from 'next/headers';
import { accessConfigured, accessUser } from './access';

/**
 * Owner-only sign-in for /insights: Cloudflare Access (an emailed code, only for INSIGHTS_EMAIL) stands in front
 * of /insights and /api/insights, and lib/access.ts checks the signed token it adds to each request.
 */

/** Only in `next dev` on your own computer: INSIGHTS_DEV_USER opens /insights without signing in. Never active on the live site. */
const devUser = () => (process.env.NODE_ENV === 'development' ? process.env.INSIGHTS_DEV_USER || '' : '');

export const authConfigured = () => Boolean(devUser()) || accessConfigured();
export { accessConfigured };

/** The signed-in owner's email, or null. */
export async function currentUser(): Promise<string | null> {
  if (devUser()) return devUser();
  return accessUser(await headers());
}
