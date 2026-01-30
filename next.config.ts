import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration - set root to current directory
  turbopack: {
    root: __dirname,
  },
  // Allow external images from Google Cloud Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/media-topfinanzas-com/**",
      },
    ],
  },
};

export default nextConfig;
