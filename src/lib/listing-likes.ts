import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLikedListingIds(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data } = await supabase
    .from("listing_likes")
    .select("listing_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((row) => row.listing_id));
}
