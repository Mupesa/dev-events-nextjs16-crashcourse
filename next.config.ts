import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./lib/images";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors:true,
  },
  cacheComponents:true,

  images:{
    // Derived from the shared allow list so config, write-time validation, and
    // the render fallback cannot drift apart.
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
