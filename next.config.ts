import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // copyright: ask AI not to train on the photographs (the text may be read and quoted by AI search; see app/robots.ts)
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noimageai' }] }];
  },
};

export default nextConfig;
