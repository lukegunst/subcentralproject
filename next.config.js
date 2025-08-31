/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t block builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t block builds on TS type errors
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig