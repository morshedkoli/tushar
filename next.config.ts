import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore generated Prisma files during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
