import type { NextConfig } from 'next';
import { SITE_HEADERS } from './lib/headers';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // lib/headers.ts; only on the built site, since `next dev` needs things the policy forbids (eval, its own socket)
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [{ source: '/:path*', headers: Object.entries(SITE_HEADERS).map(([key, value]) => ({ key, value })) }];
  },
};

export default nextConfig;
