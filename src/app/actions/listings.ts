"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { HOUSING_CATEGORY, LISTING_IMAGE_BUCKET } from "@/lib/constants";
import { normalizeListingTags } from "@/lib/tags";

const PROFILE_SELLER_DISPLAY = {
  seller_display_mode: "profile" as const,
  seller_display_name: null,
};

export type ListingFormState = {
  error?: string;
  redirectTo?: string;
};

function parseListingForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

  const isHousing = category === HOUSING_CATEGORY;
  const address_area = String(formData.get("address_area") ?? "").trim() || null;
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const bathroomsRaw = String(formData.get("bathrooms") ?? "").trim();
  const lease_start = String(formData.get("lease_start") ?? "").trim() || null;
  const lease_end = String(formData.get("lease_end") ?? "").trim() || null;
  const qualityRaw = String(formData.get("quality_rating") ?? "").trim();
  const quality_rating = qualityRaw ? parseInt(qualityRaw, 10) : null;
  const tags = normalizeListingTags(
    formData.getAll("tags").map((tag) => String(tag))
  );

  return {
    title,
    description,
    category,
    price_cents: Number.isFinite(price_cents) ? price_cents : null,
    quality_rating:
      quality_rating && quality_rating >= 1 && quality_rating <= 5
        ? quality_rating
        : null,
    tags,
    address_area: isHousing ? address_area : null,
    bedrooms: isHousing && bedroomsRaw ? parseInt(bedroomsRaw, 10) : null,
    bathrooms: isHousing && bathroomsRaw ? parseFloat(bathroomsRaw) : null,
    lease_start: isHousing ? lease_start : null,
    lease_end: isHousing ? lease_end : null,
    ...PROFILE_SELLER_DISPLAY,
  };
}

async function uploadListingImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  listingId: string,
  validImages: File[]
): Promise<string | null> {
  let uploaded = 0;

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i];
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${listingId}/${i}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .upload(path, file);

    if (uploadError) {
      return uploadError.message;
    }

    const { error: imageRowError } = await supabase
      .from("listing_images")
      .insert({
        listing_id: listingId,
        storage_path: path,
        sort_order: i,
      });

    if (imageRowError) {
      return imageRowError.message;
    }

    uploaded++;
  }

  if (uploaded === 0) {
    return "Failed to upload photos.";
  }

  return null;
}

async function createListingInternal(
  formData: FormData
): Promise<ListingFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { error: "Sign in with your Berkeley email to create listings." };
  }

  const data = parseListingForm(formData);
  const validationError = validateListingData(data);
  if (validationError) {
    return { error: validationError };
  }

  const images = formData.getAll("images") as File[];
  const validImages = images.filter((file) => file && file.size > 0);
  if (validImages.length === 0) {
    return { error: "Add at least one photo." };
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ ...data, seller_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const uploadError = await uploadListingImages(
    supabase,
    user.id,
    listing.id,
    validImages
  );

  if (uploadError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    return { error: uploadError };
  }

  revalidatePath("/");
  return { redirectTo: `/listings/${listing.id}` };
}

export async function createListingFromForm(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  return createListingInternal(formData);
}

export async function createListing(formData: FormData) {
  const result = await createListingInternal(formData);
  if (result.error) {
    redirect(`/listings/new?error=${encodeURIComponent(result.error)}`);
  }
  redirect(result.redirectTo!);
}

function validateListingData(
  data: ReturnType<typeof parseListingForm>
): string | null {
  if (!data.title || !data.description) {
    return "Title and description are required.";
  }
  if (!data.category) {
    return "Choose a category.";
  }
  if (data.price_cents == null || data.price_cents < 0) {
    return "Price is required.";
  }
  if (!data.quality_rating) {
    return "Select a quality rating from 1 to 5 stars.";
  }
  if (data.category === HOUSING_CATEGORY) {
    if (
      !data.address_area ||
      data.bedrooms == null ||
      data.bathrooms == null ||
      !data.lease_start ||
      !data.lease_end
    ) {
      return "All housing details are required for housing listings.";
    }
  }
  return null;
}

export async function updateListingFromForm(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  if (!listingId) {
    return { error: "Missing listing ID." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { error: "Verify your Berkeley email to edit listings." };
  }

  const data = parseListingForm(formData);
  const validationError = validateListingData(data);
  if (validationError) {
    return { error: validationError };
  }

  const { error } = await supabase
    .from("listings")
    .update(data)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/");
  return { redirectTo: `/listings/${listingId}` };
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
  const validationError = validateListingData(data);
  if (validationError) {
    redirect(
      `/listings/${listingId}/edit?error=${encodeURIComponent(validationError)}`
    );
  }

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

  const soldAt = new Date().toISOString();

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold", sold_at: soldAt })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/listings/${listingId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/profile/me");
  revalidatePath("/");
  redirect(`/listings/${listingId}?marked_sold=1`);
}

export async function removeListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/listings/${listingId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/profile/me");
  redirect("/");
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
