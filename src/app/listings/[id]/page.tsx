import Link from "next/link";
import { ListingImageGallery } from "@/components/ListingImageGallery";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/MessageSellerButton";
import { logListingView, markListingSold, removeListing } from "@/app/actions/listings";
import {
  formatCategory,
  formatListingPrice,
  getPublicImageUrl,
} from "@/lib/format";
import { HOUSING_CATEGORY, LISTING_IMAGE_BUCKET } from "@/lib/constants";
import {
  PROFILE_IDENTITY_SELECT,
  resolveSellerDisplayName,
  profileIsVerified,
  sellerProfileIsPublic,
} from "@/lib/profile-display";
import { StarRating } from "@/components/StarRating";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingTags } from "@/components/ListingTags";
import { ListingLikeButton } from "@/components/ListingLikeButton";
import { MarkAsSoldButton } from "@/components/MarkAsSoldButton";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { ReportButton } from "@/components/ReportButton";
import { BlockUserButton } from "@/components/BlockUserButton";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { isSoldListingVisible } from "@/lib/sold-listings";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { usersAreBlocked, viewerHasBlockedUser } from "@/lib/user-blocks";

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
  const sellerVerified = profileIsVerified(item.profiles);
  const showSellerProfile =
    sellerProfileIsPublic(item.profiles) && !isOwner;
  const images = [...(item.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const galleryImages = images.map((img) => ({
    id: img.id,
    url: getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, img.storage_path),
  }));

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
  const canLike = Boolean(user && isAuthenticatedBerkeleyUser(user));
  const messagingBlocked =
    user && !isOwner
      ? await usersAreBlocked(supabase, user.id, item.seller_id)
      : false;
  const hasBlockedSeller =
    user && !isOwner
      ? await viewerHasBlockedUser(supabase, user.id, item.seller_id)
      : false;

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
        <div>
          <ListingImageGallery images={galleryImages} alt={item.title} />
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
              loggedIn={canLike}
              loginRedirect={`/listings/${item.id}`}
              className="shrink-0"
            />
            </div>
          </div>
          <p className="text-2xl font-semibold text-[#003262] dark:text-[#FDB515]">
            {formatListingPrice(item.price_cents, item.category)}
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
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              {item.address_area && (
                <>
                  <dt className="text-zinc-500">Location</dt>
                  <dd>{item.address_area}</dd>
                </>
              )}
              {item.bedrooms != null && (
                <>
                  <dt className="text-zinc-500">Beds</dt>
                  <dd>{item.bedrooms}</dd>
                </>
              )}
              {item.bathrooms != null && (
                <>
                  <dt className="text-zinc-500">Bathrooms</dt>
                  <dd>{item.bathrooms}</dd>
                </>
              )}
              {item.sqft != null && (
                <>
                  <dt className="text-zinc-500">Sqft</dt>
                  <dd>{item.sqft.toLocaleString()}</dd>
                </>
              )}
              {item.included_utilities && (
                <>
                  <dt className="text-zinc-500">Included utilities</dt>
                  <dd>{item.included_utilities}</dd>
                </>
              )}
              {item.lease_start && item.lease_end && (
                <>
                  <dt className="text-zinc-500">Leasing</dt>
                  <dd>
                    {item.lease_start} → {item.lease_end}
                  </dd>
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
                    <DisplayNameWithBadge
                      name={sellerName}
                      verified={sellerVerified}
                    />
                  </Link>
                ) : (
                  <p className="font-medium">
                    <DisplayNameWithBadge
                      name={sellerName}
                      verified={sellerVerified}
                    />
                  </p>
                )}
                {item.profiles.bio && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                    {item.profiles.bio}
                  </p>
                )}
                {user && !isOwner && (
                  <div className="mt-3">
                    <BlockUserButton
                      blockedUserId={item.seller_id}
                      initialBlocked={hasBlockedSeller}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isOwner && canLike && (
            <div className="flex flex-wrap items-center gap-4">
              <MessageSellerButton
                listingId={item.id}
                sellerId={item.seller_id}
                user={user}
                status={item.status}
                priceLabel={formatListingPrice(item.price_cents, item.category)}
                existingConversationId={existingConversationId}
                messagingBlocked={messagingBlocked}
              />
              <ReportButton kind="listing" listingId={item.id} />
            </div>
          )}

          {isOwner && item.status === "active" && (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/listings/${item.id}/edit`}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Edit
              </Link>
              <DeleteListingButton
                action={removeListing.bind(null, item.id)}
              />
              <MarkAsSoldButton action={markListingSold.bind(null, item.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
