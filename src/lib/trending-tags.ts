import type { SupabaseClient } from "@supabase/supabase-js";

export type TrendingListingTag = {
  tag: string;
  use_count: number;
};

export async function getTrendingListingTags(
  supabase: SupabaseClient,
  limitCount = 12,
  lookbackDays = 45
): Promise<TrendingListingTag[]> {
  const { data, error } = await supabase.rpc("get_trending_listing_tags", {
    limit_count: limitCount,
    lookback_days: lookbackDays,
  });

  if (error || !data) {
    return [];
  }

  return (data as { tag: string; use_count: number | string }[])
    .map((row) => ({
      tag: String(row.tag ?? "").trim(),
      use_count: Number(row.use_count) || 0,
    }))
    .filter((row) => row.tag.length > 0);
}
