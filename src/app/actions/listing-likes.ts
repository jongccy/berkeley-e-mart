"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export async function toggleListingLike(
  listingId: string
): Promise<{ liked: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { liked: false, error: "Log in with your Berkeley account to save listings." };
  }

  const { data: existing } = await supabase
    .from("listing_likes")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("listing_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) return { liked: true, error: error.message };

    revalidatePath("/");
    revalidatePath("/profile/me");
    revalidatePath(`/listings/${listingId}`);
    return { liked: false };
  }

  const { error } = await supabase.from("listing_likes").insert({
    user_id: user.id,
    listing_id: listingId,
  });

  if (error) return { liked: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile/me");
  revalidatePath(`/listings/${listingId}`);
  return { liked: true };
}
