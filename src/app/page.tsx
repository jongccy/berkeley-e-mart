import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { BrowseHero } from "@/components/BrowseHero";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { isAuthenticatedBerkeleyUser, isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

const BROWSE_PAGE_SIZE = 16;

type SearchParams = {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  limit?: string;
};

function buildBrowseHref(
  params: SearchParams,
  limit: number
): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.min_price) search.set("min_price", params.min_price);
  if (params.max_price) search.set("max_price", params.max_price);
  if (limit > BROWSE_PAGE_SIZE) search.set("limit", String(limit));
  const query = search.toString();
  return query ? `/?${query}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  await expireSoldListings(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const soldCutoff = getSoldListingCutoffIso();

  const parsedLimit = parseInt(params.limit ?? "", 10);
  const displayLimit =
    Number.isFinite(parsedLimit) && parsedLimit >= BROWSE_PAGE_SIZE
      ? parsedLimit
      : BROWSE_PAGE_SIZE;

  let query = supabase
    .from("listings")
    .select(`*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT})`)
    .or(`status.eq.active,and(status.eq.sold,sold_at.gte.${soldCutoff})`)
    .order("created_at", { ascending: false })
    .limit(displayLimit + 1);

  if (params.category) query = query.eq("category", params.category);
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }
  if (params.min_price) {
    query = query.gte("price_cents", parseInt(params.min_price, 10) * 100);
  }
  if (params.max_price) {
    query = query.lte("price_cents", parseInt(params.max_price, 10) * 100);
  }

  const { data: listings } = await query;
  const fetched = (listings ?? []) as ListingWithImages[];
  const hasMore = fetched.length > displayLimit;
  const items = hasMore ? fetched.slice(0, displayLimit) : fetched;
  const likedIds = await getLikedListingIds(supabase, user?.id);
  const showLike = Boolean(user && isAuthenticatedBerkeleyUser(user));
  const loggedIn = showLike;

  return (
    <>
      <BrowseHero searchParams={params} />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-[#003262] dark:text-[#FDB515]">
          Browse
        </h1>

        {user && isVerifiedBerkeleyUser(user) && (
          <RecommendationsSection userId={user.id} />
        )}

        {items.length === 0 ? (
          <p className="py-8 text-center text-zinc-500">
            No listings match your search or filters.
          </p>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  supabaseUrl={supabaseUrl}
                  showLike={showLike}
                  loggedIn={loggedIn}
                  liked={likedIds.has(listing.id)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center">
                <Link
                  href={buildBrowseHref(params, displayLimit + BROWSE_PAGE_SIZE)}
                  className="rounded-lg bg-[#003262] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#002244]"
                >
                  See more
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
