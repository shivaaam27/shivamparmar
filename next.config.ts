import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // copyright: ask AI crawlers not to train on the pages or the photographs
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noai, noimageai' }] }];
  },
};

export default nextConfig;
