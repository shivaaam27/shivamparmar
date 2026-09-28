import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // a 6 MB city list read once on the server for /insights; keep it out of the bundle
  serverExternalPackages: ['all-the-cities'],
};

export default nextConfig;
