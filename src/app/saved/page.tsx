import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { ListingCard } from "@/components/ListingCard";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function SavedListingsPage() {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/saved");

  await expireSoldListings(supabase);

  const canLike = isAuthenticatedBerkeleyUser(user);

  const { data: savedRows } = await supabase
    .from("listing_likes")
    .select("listing_id, listings(*, listing_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const savedListings = (savedRows ?? [])
    .map((row) => {
      const raw = row.listings as ListingWithImages | ListingWithImages[] | null;
      return Array.isArray(raw) ? raw[0] : raw;
    })
    .filter((listing): listing is ListingWithImages => {
      if (!listing) return false;
      return listing.status !== "removed";
    });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Saved</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Listings you&apos;ve saved. Only visible to you.
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500">
            You haven&apos;t saved any listings yet.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              supabaseUrl={supabaseUrl}
              showLike={canLike}
              loggedIn={canLike}
              liked
            />
          ))}
        </div>
      )}
    </div>
  );
}
