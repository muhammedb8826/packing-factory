/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    // Proxy /api/* to your backend when using npm run dev (no custom server)
    const backend = process.env.API_BACKEND_URL || "http://127.0.0.1:3001";
    return [{ source: "/api/:path*", destination: `${backend}/:path*` }];
  },
};

export default nextConfig;
