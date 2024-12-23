/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Add this line to make it static
  images: {
    unoptimized: true,
  },
  // No need for experimental features
}

module.exports = nextConfig