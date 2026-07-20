import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_SITE_URL } from "@/lib/auth";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: CANONICAL_SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${CANONICAL_SITE_URL}/browse`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${CANONICAL_SITE_URL}/wanted`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${CANONICAL_SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${CANONICAL_SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = await createClient();
    const soldCutoff = getSoldListingCutoffIso();

    const { data: listings } = await supabase
      .from("listings")
      .select("id, updated_at, created_at")
      .or(`status.eq.active,and(status.eq.sold,sold_at.gte.${soldCutoff})`)
      .order("created_at", { ascending: false })
      .limit(5000);

    const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map(
      (listing) => ({
        url: `${CANONICAL_SITE_URL}/listings/${listing.id}`,
        lastModified: new Date(listing.updated_at ?? listing.created_at),
        changeFrequency: "daily",
        priority: 0.7,
      })
    );

    const { data: wantedPosts } = await supabase
      .from("wanted_posts")
      .select("id, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(2000);

    const wantedRoutes: MetadataRoute.Sitemap = (wantedPosts ?? []).map(
      (post) => ({
        url: `${CANONICAL_SITE_URL}/wanted/${post.id}`,
        lastModified: new Date(post.created_at),
        changeFrequency: "daily",
        priority: 0.6,
      })
    );

    return [...staticRoutes, ...listingRoutes, ...wantedRoutes];
  } catch {
    return staticRoutes;
  }
}
