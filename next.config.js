/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap.xml' }];
  },
};
module.exports = nextConfig;
