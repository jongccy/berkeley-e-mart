import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ListingForm } from "@/components/ListingForm";
import type { ExistingListingPhoto } from "@/components/ListingPhotoUpload";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import { getPublicImageUrl } from "@/lib/format";
import type { Listing, ListingImage } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false, follow: false },
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/listings/${id}/edit`);
  if (!isVerifiedBerkeleyUser(user)) redirect("/profile/me");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (!listing) notFound();

  const images = [...((listing.listing_images ?? []) as ListingImage[])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const existingPhotos: ExistingListingPhoto[] = images.map((image) => ({
    id: image.id,
    storage_path: image.storage_path,
    url: getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, image.storage_path),
  }));

  const listingRow = { ...(listing as Listing & { listing_images?: ListingImage[] }) };
  delete listingRow.listing_images;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit listing</h1>
      <ListingForm listing={listingRow} existingPhotos={existingPhotos} />
    </div>
  );
}
