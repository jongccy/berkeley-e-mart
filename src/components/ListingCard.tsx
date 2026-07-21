import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { ListingTags } from "@/components/ListingTags";
import { ListingLikeButton } from "@/components/ListingLikeButton";
import { ListingCardImageCarousel } from "@/components/ListingCardImageCarousel";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { SoldListingOverlay } from "@/components/SoldListingOverlay";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { resolveSellerDisplayName, profileIsVerified } from "@/lib/profile-display";
import type { ListingWithImages } from "@/types/database";
import { formatCategory, formatListingPrice, getPublicImageUrl } from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";

type Props = {
  listing: ListingWithImages;
  supabaseUrl: string;
  liked?: boolean;
  showLike?: boolean;
  loggedIn?: boolean;
};

/** Airy marketplace card: rounded image, overlay heart, Calket fields retained. */
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

  const isSold = listing.status === "sold";

  return (
    <div className={`group flex flex-col${isSold ? " relative" : ""}`}>
      {isSold && <SoldListingOverlay />}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <ListingCardImageCarousel
          images={cardImages}
          alt={listing.title}
          href={listingHref}
        />
        {showLike && (
          <div className="absolute right-3 top-3 z-[2]">
            <ListingLikeButton
              listingId={listing.id}
              initialLiked={liked}
              loggedIn={loggedIn}
              loginRedirect="/"
              size="sm"
              variant="overlay"
            />
          </div>
        )}
      </div>

      <Link
        href={listingHref}
        className="mt-3 flex flex-1 flex-col gap-1.5 px-0.5"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-900 transition group-hover:text-[#003262] dark:text-zinc-100 dark:group-hover:text-[#FDB515]">
            {listing.title}
          </h3>
          {isSold && (
            <span className="relative z-[2] shrink-0">
              <ListingStatusBadge status="sold" />
            </span>
          )}
        </div>

        {listing.quality_rating != null && (
          <StarRating rating={listing.quality_rating} size="sm" />
        )}

        <p className="text-base font-bold text-[#003262] dark:text-[#FDB515]">
          {formatListingPrice(listing.price_cents, listing.category)}
        </p>

        <p className="text-xs text-zinc-500">
          <DisplayNameWithBadge
            name={resolveSellerDisplayName(listing.profiles)}
            verified={profileIsVerified(listing.profiles)}
          />
        </p>

        {listing.tags?.length > 0 && (
          <ListingTags tags={listing.tags.slice(0, 3)} size="sm" />
        )}

        <p className="text-xs text-zinc-400">{formatCategory(listing.category)}</p>
      </Link>
    </div>
  );
}
