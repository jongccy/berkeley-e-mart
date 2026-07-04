"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export type BlockFormState = {
  error?: string;
  success?: boolean;
  blocked?: boolean;
};

async function blockUserInternal(blockedUserId: string): Promise<BlockFormState> {
  const blockedId = blockedUserId.trim();
  if (!blockedId) {
    return { error: "Missing user." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthenticatedBerkeleyUser(user)) {
    return { error: "Sign in with your Berkeley account to block users." };
  }

  if (user.id === blockedId) {
    return { error: "You can't block yourself." };
  }

  const { error } = await supabase.from("user_blocks").insert({
    blocker_id: user.id,
    blocked_id: blockedId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true, blocked: true };
    }
    return { error: error.message };
  }

  revalidatePath("/profile/me");
  revalidatePath(`/profile/${blockedId}`);
  revalidatePath("/inbox");
  revalidatePath("/browse");
  revalidatePath("/");

  return { success: true, blocked: true };
}

export async function blockUserFromForm(
  _prevState: BlockFormState,
  formData: FormData
): Promise<BlockFormState> {
  return blockUserInternal(String(formData.get("blocked_user_id") ?? ""));
}

export async function blockUser(blockedUserId: string): Promise<BlockFormState> {
  return blockUserInternal(blockedUserId);
}

export async function unblockUser(blockedUserId: string): Promise<BlockFormState> {
  const blockedId = blockedUserId.trim();
  if (!blockedId) {
    return { error: "Missing user." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthenticatedBerkeleyUser(user)) {
    return { error: "Sign in with your Berkeley account to manage blocks." };
  }

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile/me");
  revalidatePath(`/profile/${blockedId}`);
  revalidatePath("/inbox");
  revalidatePath("/browse");
  revalidatePath("/");

  return { success: true, blocked: false };
}
