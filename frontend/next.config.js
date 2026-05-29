/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8154";

const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_BASE}/api/v1/:path*` },
      { source: "/health", destination: `${API_BASE}/health` },
    ];
  },
};

module.exports = nextConfig;
