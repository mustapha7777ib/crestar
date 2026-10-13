import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The parent folder also contains a lockfile; pin the workspace root here.
  turbopack: { root: path.join(__dirname) },
  images: {
    // Product and review photos uploaded from /admin and the review page.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
