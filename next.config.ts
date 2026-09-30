import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // a 6 MB city list read once on the server for /insights; keep it out of the bundle
  serverExternalPackages: ['all-the-cities'],
  // copyright: ask AI crawlers not to train on the pages or the photographs
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noai, noimageai' }] }];
  },
};

export default nextConfig;
