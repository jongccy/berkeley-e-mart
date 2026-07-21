import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HomeListingCard } from "@/components/HomeListingCard";
import { HomePromoBanners } from "@/components/HomePromoBanners";
import { HomeCategoryRow } from "@/components/HomeCategoryRow";
import { HomeRequestCard, type HomeRequestPost } from "@/components/HomeRequestCard";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import { getBlockRelatedUserIds } from "@/lib/user-blocks";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Calket | Berkeley Student Marketplace",
  },
  description:
    "Buy and sell textbooks, furniture, electronics, and housing leases with verified UC Berkeley students on Calket.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calket | Berkeley Student Marketplace",
    description:
      "Buy and sell with verified Berkeley affiliates. Browse campus listings on Calket.",
    url: "/",
  },
};

const RECENT_LIMIT = 5;
const REQUESTS_LIMIT = 5;

export default async function HomePage() {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  await expireSoldListings(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const soldCutoff = getSoldListingCutoffIso();

  const [{ data: listings }, { data: wantedPosts }] = await Promise.all([
    supabase
      .from("listings")
      .select(
        `*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT})`
      )
      .or(`status.eq.active,and(status.eq.sold,sold_at.gte.${soldCutoff})`)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from("wanted_posts")
      .select(`*, profiles:user_id(${PROFILE_IDENTITY_SELECT})`)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(REQUESTS_LIMIT + 20),
  ]);

  const items = (listings ?? []) as ListingWithImages[];
  const likedIds = await getLikedListingIds(supabase, user?.id);
  const showLike = Boolean(user && isAuthenticatedBerkeleyUser(user));
  const loggedIn = showLike;

  const blockRelatedUserIds = user
    ? await getBlockRelatedUserIds(supabase)
    : new Set<string>();

  const requests = ((wantedPosts ?? []) as HomeRequestPost[])
    .filter((post) => !blockRelatedUserIds.has(post.user_id))
    .slice(0, REQUESTS_LIMIT);

  return (
    <div className="bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:space-y-14 sm:px-8 sm:py-10">
        <h1 className="sr-only">Calket — Berkeley student marketplace</h1>

        <HomePromoBanners />

        <HomeCategoryRow />

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Most recent listings
            </h2>
            <Link
              href="/browse"
              className="shrink-0 text-sm font-semibold text-[#003262] transition hover:opacity-70 dark:text-[#FDB515]"
            >
              View all →
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="py-10 text-center text-zinc-500">
              No listings yet. Be the first to{" "}
              <Link href="/listings/new" className="underline">
                sell something
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {items.map((listing) => (
                <HomeListingCard
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
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                Recent requests
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                What students are looking to buy
              </p>
            </div>
            <Link
              href="/wanted"
              className="shrink-0 text-sm font-semibold text-[#003262] transition hover:opacity-70 dark:text-[#FDB515]"
            >
              View all →
            </Link>
          </div>

          {requests.length === 0 ? (
            <p className="py-10 text-center text-zinc-500">
              No open requests yet.{" "}
              <Link href="/wanted/new" className="underline">
                Post a request
              </Link>{" "}
              if you&apos;re looking for something.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {requests.map((post) => (
                <HomeRequestCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
