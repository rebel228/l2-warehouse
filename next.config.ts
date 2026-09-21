import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'l2api.dev',
        pathname: '/icons/**',
      },
    ],
  },
};

export default nextConfig;
