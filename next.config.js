/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Add this to disable automatic static optimization for the scorecard page
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig