import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/MessageSellerButton";
import { logListingView, markListingSold } from "@/app/actions/listings";
import {
  formatPrice,
  formatCategory,
  getPublicImageUrl,
} from "@/lib/format";
import { HOUSING_CATEGORY, LISTING_IMAGE_BUCKET } from "@/lib/constants";
import {
  PROFILE_IDENTITY_SELECT,
  resolveSellerDisplayName,
  sellerProfileIsPublic,
} from "@/lib/profile-display";
import { StarRating } from "@/components/StarRating";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingTags } from "@/components/ListingTags";
import { ListingLikeButton } from "@/components/ListingLikeButton";
import { MarkAsSoldButton } from "@/components/MarkAsSoldButton";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { isSoldListingVisible } from "@/lib/sold-listings";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; marked_sold?: string }>;
}) {
  const { id } = await params;
  const { error: urlError, marked_sold: markedSold } = await searchParams;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  await expireSoldListings(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(`*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT}, avatar_url, bio)`)
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const item = listing as ListingWithImages & {
    profiles: {
      id: string;
      display_name: string | null;
      show_real_name: boolean;
      marketplace_alias: string | null;
      avatar_url: string | null;
      bio: string | null;
    };
  };

  if (
    item.status === "removed" ||
    (item.status === "sold" && !isSoldListingVisible(item.sold_at))
  ) {
    notFound();
  }

  if (user) {
    await logListingView(id);
  }

  const isOwner = user?.id === item.seller_id;
  const sellerName = resolveSellerDisplayName(item.profiles);
  const showSellerProfile =
    sellerProfileIsPublic(item.profiles) && !isOwner;
  const images = [...(item.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  let existingConversationId: string | null = null;
  if (user && user.id !== item.seller_id) {
    const { data: convo } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", id)
      .eq("buyer_id", user.id)
      .maybeSingle();
    existingConversationId = convo?.id ?? null;
  }

  const likedIds = await getLikedListingIds(supabase, user?.id);
  const isLiked = likedIds.has(id);
  const loggedIn = Boolean(user && isVerifiedBerkeleyUser(user));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#003262] hover:underline dark:text-[#FDB515]"
      >
        <span aria-hidden>←</span>
        Back to listings
      </Link>

      {urlError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {urlError}
        </p>
      )}
      {(markedSold === "1" || (isOwner && item.status === "sold")) && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          This listing is marked as sold. It will come down in 24 hours.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={getPublicImageUrl(
                    supabaseUrl,
                    LISTING_IMAGE_BUCKET,
                    img.storage_path
                  )}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              No photos
            </div>
          )}
        </div>

        <div className="space-y-4">
          <span className="rounded bg-[#003262] px-2 py-0.5 text-xs text-white">
            {formatCategory(item.category)}
          </span>
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-3xl font-bold">{item.title}</h1>
            <div className="flex shrink-0 items-center gap-2">
              {item.status === "sold" && (
                <ListingStatusBadge status="sold" />
              )}
              <ListingLikeButton
              listingId={item.id}
              initialLiked={isLiked}
              loggedIn={loggedIn}
              loginRedirect={`/listings/${item.id}`}
              className="shrink-0"
            />
            </div>
          </div>
          <p className="text-2xl font-semibold text-[#003262] dark:text-[#FDB515]">
            {formatPrice(item.price_cents)}
          </p>
          {item.quality_rating != null && (
            <StarRating rating={item.quality_rating} />
          )}
          {item.status === "active" && (
            <ListingStatusBadge status={item.status} />
          )}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
              {item.description}
            </p>
          </div>

          <ListingTags tags={item.tags ?? []} />

          {item.category === HOUSING_CATEGORY && (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {item.address_area && (
                <>
                  <dt className="text-zinc-500">Area</dt>
                  <dd>{item.address_area}</dd>
                </>
              )}
              {item.bedrooms != null && (
                <>
                  <dt className="text-zinc-500">Bedrooms</dt>
                  <dd>{item.bedrooms}</dd>
                </>
              )}
              {item.bathrooms != null && (
                <>
                  <dt className="text-zinc-500">Bathrooms</dt>
                  <dd>{item.bathrooms}</dd>
                </>
              )}
              {item.lease_start && (
                <>
                  <dt className="text-zinc-500">Lease start</dt>
                  <dd>{item.lease_start}</dd>
                </>
              )}
              {item.lease_end && (
                <>
                  <dt className="text-zinc-500">Lease end</dt>
                  <dd>{item.lease_end}</dd>
                </>
              )}
            </dl>
          )}

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500">Seller</p>
            <div className="mt-3 flex gap-4">
              {showSellerProfile ? (
                <Link href={`/profile/${item.profiles.id}`} className="shrink-0">
                  <ProfileAvatar
                    avatarUrl={item.profiles.avatar_url}
                    alt={sellerName}
                    size="sm"
                  />
                </Link>
              ) : (
                <ProfileAvatar
                  avatarUrl={item.profiles.avatar_url}
                  alt={sellerName}
                  size="sm"
                />
              )}
              <div className="min-w-0 flex-1">
                {showSellerProfile ? (
                  <Link
                    href={`/profile/${item.profiles.id}`}
                    className="font-medium hover:underline"
                  >
                    {sellerName}
                  </Link>
                ) : (
                  <p className="font-medium">{sellerName}</p>
                )}
                {item.profiles.bio && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                    {item.profiles.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isOwner && (
            <MessageSellerButton
              listingId={item.id}
              sellerId={item.seller_id}
              user={user}
              status={item.status}
              priceLabel={formatPrice(item.price_cents)}
              existingConversationId={existingConversationId}
            />
          )}

          {isOwner && item.status === "active" && (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/listings/${item.id}/edit`}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Edit
              </Link>
              <MarkAsSoldButton action={markListingSold.bind(null, item.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
