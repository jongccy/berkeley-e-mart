import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { ListingTags } from "@/components/ListingTags";
import { ListingLikeButton } from "@/components/ListingLikeButton";
import { ListingCardImageCarousel } from "@/components/ListingCardImageCarousel";
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
  const listingHref = `/listings/${listing.id}`;
  const cardImages = [...(listing.listing_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      url: getPublicImageUrl(
        supabaseUrl,
        LISTING_IMAGE_BUCKET,
        image.storage_path
      ),
    }));

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <ListingCardImageCarousel
        images={cardImages}
        alt={listing.title}
        href={listingHref}
      />
      <Link href={listingHref} className="flex flex-1 flex-col">
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
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-[#003262] dark:text-[#FDB515]">
                {formatPrice(listing.price_cents)}
              </p>
              <p className="text-xs text-zinc-500">
                {resolveSellerDisplayName(listing.profiles)}
              </p>
            </div>
            {showLike && (
              <ListingLikeButton
                listingId={listing.id}
                initialLiked={liked}
                loggedIn={loggedIn}
                loginRedirect="/"
                size="sm"
                variant="inline"
              />
            )}
          </div>
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
