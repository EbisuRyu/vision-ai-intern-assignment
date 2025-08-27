/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: ['localhost'],
    unoptimized: true
  },

  experimental: {
    serverComponentsExternalPackages: []
  }
}

module.exports = nextConfig