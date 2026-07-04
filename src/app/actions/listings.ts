"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { FREE_CATEGORY, HOUSING_CATEGORY, LISTING_IMAGE_BUCKET } from "@/lib/constants";
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
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;
  const resolvedPriceCents = Number.isFinite(price_cents) ? price_cents : null;
  const category =
    resolvedPriceCents === 0 ? FREE_CATEGORY : categoryRaw;

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
    price_cents: resolvedPriceCents,
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
    const uploadError = await uploadListingImageFile(
      supabase,
      listingId,
      path,
      file,
      i
    );

    if (uploadError) {
      return uploadError;
    }

    uploaded++;
  }

  if (uploaded === 0) {
    return "Failed to upload photos.";
  }

  return null;
}

async function uploadListingImageFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  storagePath: string,
  file: File,
  sortOrder: number
): Promise<string | null> {
  const { error: uploadError } = await supabase.storage
    .from(LISTING_IMAGE_BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    return uploadError.message;
  }

  const { error: imageRowError } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    storage_path: storagePath,
    sort_order: sortOrder,
  });

  if (imageRowError) {
    return imageRowError.message;
  }

  return null;
}

function parsePhotoOrder(raw: string): string[] | null {
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((entry) => typeof entry === "string")) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function syncListingImagesOnUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  listingId: string,
  formData: FormData
): Promise<string | null> {
  const photoOrder = parsePhotoOrder(String(formData.get("photo_order") ?? ""));
  if (photoOrder === null) {
    return "Invalid photo order.";
  }
  if (photoOrder.length === 0) {
    return "Keep at least one photo.";
  }

  const newFiles = (formData.getAll("images") as File[]).filter(
    (file) => file && file.size > 0
  );

  const { data: currentImages, error: fetchError } = await supabase
    .from("listing_images")
    .select("id, storage_path")
    .eq("listing_id", listingId);

  if (fetchError) {
    return fetchError.message;
  }

  const currentById = new Map(
    (currentImages ?? []).map((image) => [image.id, image.storage_path])
  );
  const keptExistingIds = new Set<string>();
  const newIndices: number[] = [];

  for (const entry of photoOrder) {
    if (entry.startsWith("e:")) {
      const imageId = entry.slice(2);
      if (!currentById.has(imageId)) {
        return "One or more photos could not be found.";
      }
      if (keptExistingIds.has(imageId)) {
        return "Invalid photo order.";
      }
      keptExistingIds.add(imageId);
      continue;
    }

    if (entry.startsWith("n:")) {
      const index = Number.parseInt(entry.slice(2), 10);
      if (!Number.isInteger(index) || index < 0 || index >= newFiles.length) {
        return "Invalid new photo order.";
      }
      newIndices.push(index);
      continue;
    }

    return "Invalid photo order.";
  }

  if (newIndices.length !== newFiles.length) {
    return "Invalid photo order.";
  }

  const uniqueNewIndices = new Set(newIndices);
  if (uniqueNewIndices.size !== newIndices.length) {
    return "Invalid photo order.";
  }

  for (let i = 0; i < newFiles.length; i++) {
    if (!uniqueNewIndices.has(i)) {
      return "Invalid photo order.";
    }
  }

  const removedPaths = (currentImages ?? [])
    .filter((image) => !keptExistingIds.has(image.id))
    .map((image) => image.storage_path);

  if (removedPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .remove(removedPaths);

    if (storageError) {
      return storageError.message;
    }

    const { error: deleteError } = await supabase
      .from("listing_images")
      .delete()
      .eq("listing_id", listingId)
      .in(
        "id",
        (currentImages ?? [])
          .filter((image) => !keptExistingIds.has(image.id))
          .map((image) => image.id)
      );

    if (deleteError) {
      return deleteError.message;
    }
  }

  const uploadedByIndex = new Map<number, string>();

  for (const entry of photoOrder) {
    if (!entry.startsWith("n:")) continue;

    const index = Number.parseInt(entry.slice(2), 10);
    if (uploadedByIndex.has(index)) continue;

    const file = newFiles[index];
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${userId}/${listingId}/${crypto.randomUUID()}.${ext}`;
    const uploadError = await uploadListingImageFile(
      supabase,
      listingId,
      storagePath,
      file,
      0
    );

    if (uploadError) {
      return uploadError;
    }

    const { data: inserted, error: lookupError } = await supabase
      .from("listing_images")
      .select("id")
      .eq("listing_id", listingId)
      .eq("storage_path", storagePath)
      .single();

    if (lookupError || !inserted) {
      return lookupError?.message ?? "Failed to save uploaded photo.";
    }

    uploadedByIndex.set(index, inserted.id);
  }

  let sortOrder = 0;
  for (const entry of photoOrder) {
    const imageId = entry.startsWith("e:")
      ? entry.slice(2)
      : uploadedByIndex.get(Number.parseInt(entry.slice(2), 10));

    if (!imageId) {
      return "Failed to resolve photo order.";
    }

    const { error: sortError } = await supabase
      .from("listing_images")
      .update({ sort_order: sortOrder })
      .eq("id", imageId)
      .eq("listing_id", listingId);

    if (sortError) {
      return sortError.message;
    }

    sortOrder++;
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

  const imageError = await syncListingImagesOnUpdate(
    supabase,
    user.id,
    listingId,
    formData
  );

  if (imageError) {
    return { error: imageError };
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

  const imageError = await syncListingImagesOnUpdate(
    supabase,
    user.id,
    listingId,
    formData
  );

  if (imageError) {
    redirect(
      `/listings/${listingId}/edit?error=${encodeURIComponent(imageError)}`
    );
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
