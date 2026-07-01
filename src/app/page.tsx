import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { ListingFilters } from "@/components/ListingFilters";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
};

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

  let query = supabase
    .from("listings")
    .select(`*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT})`)
    .or(`status.eq.active,and(status.eq.sold,sold_at.gte.${soldCutoff})`)
    .order("created_at", { ascending: false })
    .limit(48);

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
  const items = (listings ?? []) as ListingWithImages[];
  const likedIds = await getLikedListingIds(supabase, user?.id);
  const showLike = Boolean(user);
  const loggedIn = Boolean(user && isVerifiedBerkeleyUser(user));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Buy and sell with verified Berkeley students.
        </p>
      </div>

      <ListingFilters searchParams={params} />

      {user && isVerifiedBerkeleyUser(user) && (
        <RecommendationsSection userId={user.id} />
      )}

      {items.length === 0 ? (
        <p className="text-center text-zinc-500">No listings match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  );
}
