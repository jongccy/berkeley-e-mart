import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar } from "@/app/actions/profile";
import { signOut } from "@/app/actions/auth";
import { isAuthenticatedBerkeleyUser, isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { ListingCard } from "@/components/ListingCard";
import { MyListingDashboard } from "@/components/MyListingDashboard";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import {
  BlockedUsersSection,
  type BlockedUserItem,
} from "@/components/BlockedUsersSection";
import {
  countArchivedSoldListings,
  expireSoldListings,
} from "@/lib/expire-sold-listings";
import { formatArchivedSoldCount, getSoldListingCutoffIso } from "@/lib/sold-listings";
import { getMyListingViewCounts } from "@/lib/listing-view-counts";
import { getPublicImageUrl } from "@/lib/format";
import { LISTING_IMAGE_BUCKET } from "@/lib/constants";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import type { ListingWithImages, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

export default async function MyProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; tab?: string }>;
}) {
  const { error: urlError, saved, tab } = await searchParams;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/me");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const verified = isVerifiedBerkeleyUser(user);
  const canLike = isAuthenticatedBerkeleyUser(user);

  await expireSoldListings(supabase);

  const showSold = tab === "sold";
  const soldCutoff = getSoldListingCutoffIso();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("seller_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  const activeItems = (listings ?? []) as ListingWithImages[];

  const viewCounts = await getMyListingViewCounts(
    supabase,
    activeItems.map((listing) => listing.id)
  );

  const dashboardItems = activeItems.map((listing) => {
    const images = [...(listing.listing_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const firstImage = images[0];

    return {
      id: listing.id,
      title: listing.title,
      priceCents: listing.price_cents,
      status: listing.status,
      imageUrl: firstImage
        ? getPublicImageUrl(supabaseUrl, LISTING_IMAGE_BUCKET, firstImage.storage_path)
        : null,
      viewCount: viewCounts.get(listing.id) ?? 0,
    };
  });

  const { data: recentSoldListings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("seller_id", user.id)
    .eq("status", "sold")
    .gte("sold_at", soldCutoff)
    .order("sold_at", { ascending: false });
  const recentSoldItems = (recentSoldListings ?? []) as ListingWithImages[];

  const archivedSoldCount = await countArchivedSoldListings(supabase, user.id);

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

  const { data: blockRows } = await supabase
    .from("user_blocks")
    .select(
      `
      blocked_id,
      created_at,
      blocked:blocked_id(${PROFILE_IDENTITY_SELECT}, avatar_url)
    `
    )
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  const blockedUsers: BlockedUserItem[] = (blockRows ?? [])
    .map((row) => {
      const raw = row.blocked as
        | (BlockedUserItem["profile"] & { id: string; avatar_url: string | null })
        | (BlockedUserItem["profile"] & { id: string; avatar_url: string | null })[]
        | null;
      const blocked = Array.isArray(raw) ? raw[0] : raw;
      if (!blocked) return null;

      return {
        id: blocked.id,
        blockedAt: row.created_at,
        avatarUrl: blocked.avatar_url,
        profile: {
          display_name: blocked.display_name,
          show_real_name: blocked.show_real_name,
          marketplace_alias: blocked.marketplace_alias,
          is_verified_berkeley: blocked.is_verified_berkeley,
        },
      };
    })
    .filter((item): item is BlockedUserItem => item !== null);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
      <AvatarUpload
        avatarUrl={profile?.avatar_url ?? null}
        action={uploadAvatar}
      />

      {urlError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {urlError}
        </p>
      )}
      {saved === "1" && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          Profile saved.
        </p>
      )}
      {!verified && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Email not verified. Check your inbox for the verification link.
        </p>
      )}

      <ProfileSettingsForm
        profile={profile as Profile | null}
        userEmail={user.email ?? ""}
      />

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">My listings</h2>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/listings/new"
              className="font-medium text-[#003262] underline dark:text-[#FDB515]"
            >
              + New
            </Link>
            <Link
              href="/profile/me"
              className={
                !showSold
                  ? "font-medium text-[#003262] dark:text-[#FDB515]"
                  : "text-zinc-500"
              }
            >
              Active
            </Link>
            <Link
              href="/profile/me?tab=sold"
              className={
                showSold
                  ? "font-medium text-[#003262] dark:text-[#FDB515]"
                  : "text-zinc-500"
              }
            >
              Sold
            </Link>
          </div>
        </div>
        {showSold ? (
          <>
            {recentSoldItems.length > 0 ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {recentSoldItems.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    supabaseUrl={supabaseUrl}
                  />
                ))}
              </div>
            ) : archivedSoldCount === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No sold listings yet.</p>
            ) : null}
            {archivedSoldCount > 0 && (
              <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {formatArchivedSoldCount(archivedSoldCount)}
              </p>
            )}
          </>
        ) : (
          <MyListingDashboard listings={dashboardItems} />
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold">Saved</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Listings you&apos;ve liked. Only visible to you.
        </p>
        {savedListings.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No saved listings yet.</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
      </section>

      <BlockedUsersSection users={blockedUsers} />

      <p className="text-center text-sm">
        <Link href={`/profile/${user.id}`} className="text-[#003262] underline">
          View public profile
        </Link>
        {" · "}
        <Link href="/inbox" className="text-[#003262] underline">
          Your messages
        </Link>
      </p>

      <form action={signOut} className="pt-2 text-center">
        <button
          type="submit"
          className="text-sm text-zinc-500 hover:text-red-600 hover:underline dark:hover:text-red-400"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
