import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/auth";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/inbox",
        "/inbox/",
        "/listings/new",
        "/listings/*/edit",
        "/wanted/new",
        "/profile/me",
        "/saved",
        "/login",
        "/signup",
        "/accept-terms",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}
