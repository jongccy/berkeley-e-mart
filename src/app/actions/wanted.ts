"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export async function createWantedPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    redirect("/wanted/new?error=Verify your Berkeley email to post requests.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "other").trim();
  const maxPriceRaw = String(formData.get("max_price") ?? "").trim();
  const max_price_cents = maxPriceRaw
    ? Math.round(parseFloat(maxPriceRaw) * 100)
    : null;

  if (!title || !description) {
    redirect("/wanted/new?error=Title and description are required.");
  }

  const { data, error } = await supabase
    .from("wanted_posts")
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      max_price_cents,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/wanted/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/wanted");
  redirect(`/wanted/${data.id}`);
}

export async function closeWantedPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("wanted_posts")
    .update({ status: "closed" })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/wanted/${postId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/wanted");
  revalidatePath(`/wanted/${postId}`);
  redirect(`/wanted/${postId}`);
}
