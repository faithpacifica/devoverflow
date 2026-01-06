import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages:['pino','pino-pretty'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
