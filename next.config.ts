import type { NextConfig } from 'next';
import { SITE_HEADERS } from './lib/headers';
import { REDIRECTS } from './lib/redirects';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // lib/headers.ts; only on the built site, since `next dev` needs things the policy forbids (eval, its own socket)
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [{ source: '/:path*', headers: Object.entries(SITE_HEADERS).map(([key, value]) => ({ key, value })) }];
  },
  // lib/redirects.ts (the live site answers them in worker.ts)
  async redirects() {
    return [
      ...Object.entries(REDIRECTS).map(([source, destination]) => ({ source, destination, permanent: false })),
      // the old /v2 test addresses (worker.ts does the same on the live site)
      { source: '/v2', destination: '/', permanent: true },
      { source: '/v2/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
