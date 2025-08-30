import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Temporarily disable ESLint during builds to focus on functionality
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async headers() {
    return [
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
