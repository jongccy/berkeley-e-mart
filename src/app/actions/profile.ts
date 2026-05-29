"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_BUCKET } from "@/lib/constants";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/me");

  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile/me?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile/me");
  revalidatePath(`/profile/${user.id}`);
  redirect("/profile/me");
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
