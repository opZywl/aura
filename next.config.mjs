/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'api.example.com'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
    optimizePackageImports: [],
  },
  ...(process.env.NODE_ENV === 'development' && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-Content-Type-Options', 
              value: 'nosniff'
            },
            {
              key: 'X-Custom-Port-Config',
              value: 'avoid-3001'
            }
          ]
        }
      ]
    }
  }),
  // Desabilitar webpack dev middleware indicators
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false
    }
    return config
  }
}

export default nextConfig
