/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    // Use remotePatterns for better security and flexibility
    remotePatterns: [
      // Local development domains
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
      // Production API domain (from environment variable)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_DOMAIN || 'api.saqibeduhub.com',
        port: '',
        pathname: '/**',
      },
      // Production frontend domain (from environment variable)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_DOMAIN || 'saqibeduhub.com',
        port: '',
        pathname: '/**',
      },
      // External image sources
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
