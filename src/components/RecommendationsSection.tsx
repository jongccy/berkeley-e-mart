import { createClient } from "@/lib/supabase/server";
import { getLikedListingIds } from "@/lib/listing-likes";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import { ListingCard } from "./ListingCard";
import type { ListingWithImages } from "@/types/database";

export async function RecommendationsSection({ userId }: { userId: string }) {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data: views } = await supabase
    .from("listing_views")
    .select("listing_id, listings(category)")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(5);

  if (!views?.length) return null;

  const categories = [
    ...new Set(
      views
        .map((v) => {
          const raw = v.listings as
            | { category: string }
            | { category: string }[]
            | null;
          const listing = Array.isArray(raw) ? raw[0] : raw;
          return listing?.category;
        })
        .filter((c): c is string => Boolean(c))
    ),
  ];

  if (!categories.length) return null;

  const viewedIds = views.map((v) => v.listing_id);

  let query = supabase
    .from("listings")
    .select(`*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT})`)
    .eq("status", "active")
    .in("category", categories)
    .neq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (viewedIds.length > 0) {
    query = query.not("id", "in", `(${viewedIds.join(",")})`);
  }

  const { data: recommendations } = await query;

  const listings = (recommendations ?? []) as ListingWithImages[];
  if (!listings.length) return null;

  const likedIds = await getLikedListingIds(supabase, userId);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Recommended for you</h2>
      <p className="text-sm text-zinc-500">
        Based on listings you&apos;ve recently viewed
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            supabaseUrl={supabaseUrl}
            showLike
            loggedIn
            liked={likedIds.has(listing.id)}
          />
        ))}
      </div>
    </section>
  );
}
