/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // API routes configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_USE_LIVE_DATA: process.env.NEXT_PUBLIC_USE_LIVE_DATA || 'false',
    NEXT_PUBLIC_AUTO_REFRESH_INTERVAL: process.env.NEXT_PUBLIC_AUTO_REFRESH_INTERVAL || '30000',
    NEXT_PUBLIC_DEFAULT_MIN_HOLY_GRAIL: process.env.NEXT_PUBLIC_DEFAULT_MIN_HOLY_GRAIL || '60',
  },
  
  // Performance optimizations
  experimental: {
    scrollRestoration: true,
  },
}

module.exports = nextConfig
