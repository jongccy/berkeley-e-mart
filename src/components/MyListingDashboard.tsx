"use client";

import Link from "next/link";
import { markListingSold, removeListing } from "@/app/actions/listings";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingThumbnail } from "@/components/ListingThumbnail";
import { MarkAsSoldButton } from "@/components/MarkAsSoldButton";
import { formatPrice } from "@/lib/format";
import { formatViewCount } from "@/lib/listing-view-counts";
import type { ListingStatus } from "@/types/database";

export type MyListingDashboardItem = {
  id: string;
  title: string;
  priceCents: number | null;
  status: ListingStatus;
  imageUrl: string | null;
  viewCount: number;
};

type Props = {
  listings: MyListingDashboardItem[];
};

export function MyListingDashboard({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div className="mt-3 space-y-3">
        <p className="text-sm text-zinc-500">No active listings yet.</p>
        <Link
          href="/listings/new"
          className="inline-block text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          Create a listing
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
      {listings.map((listing) => (
        <li key={listing.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <Link
            href={`/listings/${listing.id}`}
            className="shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] dark:focus:ring-[#FDB515]"
            aria-label={`View ${listing.title}`}
          >
            <ListingThumbnail
              imageUrl={listing.imageUrl}
              alt={listing.title}
              size="xs"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/listings/${listing.id}`}
                  className="line-clamp-2 font-medium hover:underline"
                >
                  {listing.title}
                </Link>
                <p className="mt-0.5 text-sm font-semibold text-[#003262] dark:text-[#FDB515]">
                  {formatPrice(listing.priceCents)}
                </p>
              </div>
              <ListingStatusBadge status={listing.status} />
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              {formatViewCount(listing.viewCount)}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={`/listings/${listing.id}`}
                className="text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
              >
                View
              </Link>
              <Link
                href={`/listings/${listing.id}/edit`}
                className="text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
              >
                Edit
              </Link>
              <MarkAsSoldButton
                action={markListingSold.bind(null, listing.id)}
                variant="inline"
              />
              <DeleteListingButton
                action={removeListing.bind(null, listing.id)}
                variant="inline"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
