import Link from "next/link";
import Image from "next/image";
import type { ListingWithImages } from "@/types/database";
import { formatPrice, formatListingType, getPublicImageUrl } from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";

type Props = {
  listing: ListingWithImages;
  supabaseUrl: string;
};

export function ListingCard({ listing, supabaseUrl }: Props) {
  const firstImage = listing.listing_images?.[0];
  const imageUrl = firstImage
    ? getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, firstImage.storage_path)
    : null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
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
          {formatListingType(listing.type)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-medium group-hover:underline">
          {listing.title}
        </h3>
        <p className="text-lg font-semibold text-[#003262] dark:text-[#FDB515]">
          {formatPrice(listing.price_cents)}
        </p>
        <p className="text-xs text-zinc-500">{listing.category}</p>
      </div>
    </Link>
  );
}
