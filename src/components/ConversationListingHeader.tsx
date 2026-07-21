import Link from "next/link";
import { formatPrice, getPublicImageUrl } from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { SoldListingOverlay } from "@/components/SoldListingOverlay";
import { ListingThumbnail } from "@/components/ListingThumbnail";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import type { ListingStatus } from "@/types/database";

type Props = {
  listingId: string;
  title: string;
  priceCents: number | null;
  imageUrl: string | null;
  otherPartyName: string;
  otherPartyVerified?: boolean;
  listingStatus: ListingStatus;
};

export function ConversationListingHeader({
  listingId,
  title,
  priceCents,
  imageUrl,
  otherPartyName,
  otherPartyVerified = false,
  listingStatus,
}: Props) {
  const isSold = listingStatus === "sold";

  return (
    <div
      className={`flex gap-4 rounded-2xl border border-zinc-200/80 p-4 dark:border-zinc-800${isSold ? " relative" : ""}`}
    >
      {isSold && <SoldListingOverlay />}
      <Link
        href={`/listings/${listingId}`}
        className="relative z-[2] shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] dark:focus:ring-[#FDB515]"
        aria-label={`View listing: ${title}`}
      >
        <ListingThumbnail imageUrl={imageUrl} alt={title} size="md" />
      </Link>
      <div className="relative z-[2] min-w-0 flex-1">
        <p className="text-xs text-zinc-500">
          Chat with{" "}
          <DisplayNameWithBadge
            name={otherPartyName}
            verified={otherPartyVerified}
          />
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <h1 className="line-clamp-2 text-lg font-bold">{title}</h1>
          <ListingStatusBadge status={listingStatus} />
        </div>
        <p className="mt-1 text-base font-semibold text-[#003262] dark:text-[#FDB515]">
          {formatPrice(priceCents)}
        </p>
        <Link
          href={`/listings/${listingId}`}
          className="mt-2 inline-block text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          View listing
        </Link>
      </div>
    </div>
  );
}

export function getListingHeaderImageUrl(
  supabaseUrl: string,
  images: { storage_path: string; sort_order: number }[] | null | undefined
): string | null {
  if (!images?.length) return null;
  const first = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
  return getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, first.storage_path);
}
