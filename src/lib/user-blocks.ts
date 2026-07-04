import type { SupabaseClient } from "@supabase/supabase-js";

export async function usersAreBlocked(
  supabase: SupabaseClient,
  userA: string,
  userB: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("users_are_blocked", {
    user_a: userA,
    user_b: userB,
  });

  if (error) {
    console.error("users_are_blocked:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function getBlockRelatedUserIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const { data, error } = await supabase.rpc("get_my_block_related_user_ids");

  if (error) {
    console.error("get_my_block_related_user_ids:", error.message);
    return new Set();
  }

  return new Set((data ?? []) as string[]);
}

export async function viewerHasBlockedUser(
  supabase: SupabaseClient,
  viewerId: string,
  otherUserId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("blocker_id", viewerId)
    .eq("blocked_id", otherUserId)
    .maybeSingle();

  if (error) {
    console.error("viewerHasBlockedUser:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function getViewerBlockedUserIds(
  supabase: SupabaseClient,
  viewerId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", viewerId);

  if (error) {
    console.error("getViewerBlockedUserIds:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.blocked_id));
}

export const BLOCKED_MESSAGING_MESSAGE =
  "You can't message this user.";

export const BLOCKED_LISTING_MESSAGE =
  "This listing isn't available.";
