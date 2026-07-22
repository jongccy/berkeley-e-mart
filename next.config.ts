import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  turbopack: {
    // A stray lockfile in the home directory makes Next infer the wrong root.
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Phone photos easily exceed the default 1MB Server Action limit.
      bodySizeLimit: "50mb",
    },
    // Proxy clones request bodies (default 10MB). Keep in sync with uploads.
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost === "*.supabase.co" ? "*.supabase.co" : supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
