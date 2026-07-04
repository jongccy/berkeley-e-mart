import type { SupabaseClient } from "@supabase/supabase-js";

export function formatViewCount(count: number): string {
  if (count === 0) return "No views yet";
  if (count === 1) return "1 view";
  return `${count} views`;
}

export async function getMyListingViewCounts(
  supabase: SupabaseClient,
  listingIds: string[]
): Promise<Map<string, number>> {
  if (listingIds.length === 0) return new Map();

  const { data, error } = await supabase.rpc("get_my_listing_view_counts", {
    listing_ids: listingIds,
  });

  if (error) {
    console.error("get_my_listing_view_counts:", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row: { listing_id: string; view_count: number }) => [
      row.listing_id,
      Number(row.view_count),
    ])
  );
}
