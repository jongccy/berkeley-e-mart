"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import type { ListingType } from "@/types/database";

function parseListingForm(formData: FormData) {
  const type = String(formData.get("type")) as ListingType;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "general").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

  const address_area = String(formData.get("address_area") ?? "").trim() || null;
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const bathroomsRaw = String(formData.get("bathrooms") ?? "").trim();
  const lease_start = String(formData.get("lease_start") ?? "").trim() || null;
  const lease_end = String(formData.get("lease_end") ?? "").trim() || null;

  return {
    type,
    title,
    description,
    category,
    price_cents: Number.isFinite(price_cents) ? price_cents : null,
    address_area: type === "lease" ? address_area : null,
    bedrooms: bedroomsRaw ? parseInt(bedroomsRaw, 10) : null,
    bathrooms: bathroomsRaw ? parseFloat(bathroomsRaw) : null,
    lease_start: type === "lease" ? lease_start : null,
    lease_end: type === "lease" ? lease_end : null,
  };
}

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    redirect("/listings/new?error=Verify your Berkeley email to create listings.");
  }

  const data = parseListingForm(formData);
  if (!data.title || !data.description) {
    redirect("/listings/new?error=Title and description are required.");
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ ...data, seller_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/listings/new?error=${encodeURIComponent(error.message)}`);
  }

  const images = formData.getAll("images") as File[];
  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${listing.id}/${i}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .upload(path, file);

    if (!uploadError) {
      await supabase.from("listing_images").insert({
        listing_id: listing.id,
        storage_path: path,
        sort_order: i,
      });
    }
  }

  revalidatePath("/");
  redirect(`/listings/${listing.id}`);
}

export async function updateListing(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    redirect(`/listings/${listingId}/edit?error=Verify your Berkeley email to edit listings.`);
  }

  const data = parseListingForm(formData);

  const { error } = await supabase
    .from("listings")
    .update(data)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/listings/${listingId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/");
  redirect(`/listings/${listingId}`);
}

export async function markListingSold(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/listings/${listingId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/profile/${user.id}`);
  redirect(`/listings/${listingId}`);
}

export async function removeListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect(`/profile/${user.id}`);
}

export async function logListingView(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) return;

  await supabase.from("listing_views").upsert(
    { user_id: user.id, listing_id: listingId, viewed_at: new Date().toISOString() },
    { onConflict: "user_id,listing_id" }
  );
}
