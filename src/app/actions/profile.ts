"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_BUCKET } from "@/lib/constants";

export type ProfileFormState = {
  error?: string;
};

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/me");

  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const identity_mode = String(formData.get("identity_mode") ?? "real_name");
  const show_real_name = identity_mode !== "alias";
  const marketplace_alias = String(formData.get("marketplace_alias") ?? "").trim();

  if (!show_real_name && !marketplace_alias) {
    return {
      error: "Enter a marketplace ID or choose to share your display name.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      bio: bio || null,
      show_real_name,
      marketplace_alias: marketplace_alias || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile/me");
  revalidatePath(`/profile/${user.id}`);
  redirect("/profile/me?saved=1");
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/me");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    redirect("/profile/me?error=No file selected.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    redirect(`/profile/me?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile/me?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile/me");
  revalidatePath(`/profile/${user.id}`);
  redirect("/profile/me");
}
