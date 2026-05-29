import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSellerButton } from "@/components/MessageSellerButton";
import { logListingView, markListingSold } from "@/app/actions/listings";
import {
  formatPrice,
  formatListingType,
  getPublicImageUrl,
} from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_images(*), profiles:seller_id(id, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const item = listing as ListingWithImages & {
    profiles: { id: string; display_name: string | null; avatar_url: string | null };
  };

  if (user) {
    await logListingView(id);
  }

  const isOwner = user?.id === item.seller_id;
  const images = [...(item.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
            {formatListingType(item.type)}
          </span>
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-2xl font-semibold text-[#003262] dark:text-[#FDB515]">
            {formatPrice(item.price_cents)}
          </p>
          <p className="text-sm text-zinc-500">
            {item.category} · {item.status}
          </p>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {item.description}
          </p>

          {item.type === "lease" && (
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
            <p className="text-sm text-zinc-500">Seller</p>
            <Link
              href={`/profile/${item.profiles.id}`}
              className="font-medium hover:underline"
            >
              {item.profiles.display_name ?? "Berkeley Student"}
            </Link>
          </div>

          {item.status === "active" && (
            <MessageSellerButton
              listingId={item.id}
              sellerId={item.seller_id}
              user={user}
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
              <form action={markListingSold.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FDB515] px-4 py-2 text-sm font-medium text-[#003262]"
                >
                  Mark as sold
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
