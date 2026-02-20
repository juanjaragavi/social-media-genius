import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration - set root to current directory
  turbopack: {
    root: __dirname,
  },
  // Allow external images from Google Cloud Storage and Google OAuth profile pictures
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/media-topfinanzas-com/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/social-media-genius-media-development/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
