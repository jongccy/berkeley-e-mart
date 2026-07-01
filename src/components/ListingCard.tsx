import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/StarRating";
import { ListingTags } from "@/components/ListingTags";
import { ListingLikeButton } from "@/components/ListingLikeButton";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { resolveSellerDisplayName } from "@/lib/profile-display";
import type { ListingWithImages } from "@/types/database";
import { formatPrice, formatCategory, getPublicImageUrl } from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";

type Props = {
  listing: ListingWithImages;
  supabaseUrl: string;
  liked?: boolean;
  showLike?: boolean;
  loggedIn?: boolean;
};

export function ListingCard({
  listing,
  supabaseUrl,
  liked = false,
  showLike = false,
  loggedIn = false,
}: Props) {
  const firstImage = listing.listing_images?.[0];
  const imageUrl = firstImage
    ? getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, firstImage.storage_path)
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {showLike && (
        <ListingLikeButton
          listingId={listing.id}
          initialLiked={liked}
          loggedIn={loggedIn}
          loginRedirect="/"
          size="sm"
          className="absolute right-2 top-2 z-10"
        />
      )}
      <Link
        href={`/listings/${listing.id}`}
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              No image
            </div>
          )}
          <span className="absolute left-2 top-2 rounded bg-[#003262] px-2 py-0.5 text-xs text-white">
            {formatCategory(listing.category)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 min-w-0 flex-1 font-medium group-hover:underline">
              {listing.title}
            </h3>
            {listing.status === "sold" && (
              <span className="shrink-0">
                <ListingStatusBadge status="sold" />
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-[#003262] dark:text-[#FDB515]">
            {formatPrice(listing.price_cents)}
          </p>
          <p className="text-xs text-zinc-500">
            {resolveSellerDisplayName(listing.profiles)}
          </p>
          {listing.quality_rating != null && (
            <StarRating rating={listing.quality_rating} size="sm" />
          )}
          {listing.tags?.length > 0 && (
            <ListingTags tags={listing.tags.slice(0, 3)} size="sm" />
          )}
          <p className="text-xs text-zinc-500">{formatCategory(listing.category)}</p>
        </div>
      </Link>
    </div>
  );
}
