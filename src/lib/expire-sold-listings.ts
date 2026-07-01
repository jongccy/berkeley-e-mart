import type { SupabaseClient } from "@supabase/supabase-js";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";

export async function expireSoldListings(supabase: SupabaseClient) {
  const cutoff = getSoldListingCutoffIso();

  await supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("status", "sold")
    .not("sold_at", "is", null)
    .lt("sold_at", cutoff);
}

export async function countArchivedSoldListings(
  supabase: SupabaseClient,
  sellerId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .eq("status", "removed")
    .not("sold_at", "is", null);

  if (error) return 0;
  return count ?? 0;
}
