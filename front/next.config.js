/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  eslint: {
    // Ignore ESLint errors during build (only for production)
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle ethers.js properly
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Transpile ethers for SSR compatibility
  transpilePackages: ['ethers'],
};

module.exports = nextConfig;