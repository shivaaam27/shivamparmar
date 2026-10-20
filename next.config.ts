import type { NextConfig } from 'next';
import { SITE_HEADERS } from './lib/headers';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // lib/headers.ts; only on the built site, since `next dev` needs things the policy forbids (eval, its own socket)
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [{ source: '/:path*', headers: Object.entries(SITE_HEADERS).map(([key, value]) => ({ key, value })) }];
  },
  // shivolabs.com/get: the Shivo Labs download page (Setup.exe, the one-line install). Not permanent, so it can move to
  // another address later (e.g. a company domain) without browsers remembering the old one.
  async redirects() {
    return [{ source: '/get', destination: 'https://shivo-id.ishivamparmar.workers.dev/', permanent: false }];
  },
};

export default nextConfig;
