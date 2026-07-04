import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { BlockUserButton } from "@/components/BlockUserButton";
import { resolvePublicName, profileIsVerified } from "@/lib/profile-display";
import { viewerHasBlockedUser } from "@/lib/user-blocks";
import {
  countArchivedSoldListings,
  expireSoldListings,
} from "@/lib/expire-sold-listings";
import { formatArchivedSoldCount, getSoldListingCutoffIso } from "@/lib/sold-listings";
import type { ListingWithImages, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  await expireSoldListings(supabase);

  const showSold = tab === "sold";
  const soldCutoff = getSoldListingCutoffIso();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("seller_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  const activeItems = (listings ?? []) as ListingWithImages[];

  const { data: recentSoldListings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("seller_id", id)
    .eq("status", "sold")
    .gte("sold_at", soldCutoff)
    .order("sold_at", { ascending: false });
  const recentSoldItems = (recentSoldListings ?? []) as ListingWithImages[];

  const archivedSoldCount = await countArchivedSoldListings(supabase, id);
  const isOwnProfile = user?.id === id;
  const hasBlockedUser =
    user && !isOwnProfile
      ? await viewerHasBlockedUser(supabase, user.id, id)
      : false;
  const publicName = resolvePublicName(profile as Profile);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <ProfileAvatar avatarUrl={profile.avatar_url} alt={publicName} />
        <h1 className="text-xl font-bold">
          <DisplayNameWithBadge
            name={publicName}
            verified={profileIsVerified(profile as Profile)}
          />
        </h1>
        {isOwnProfile && (
          <Link
            href="/profile/me"
            className="text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
          >
            Edit profile
          </Link>
        )}
        {user && !isOwnProfile && (
          <BlockUserButton
            blockedUserId={id}
            initialBlocked={hasBlockedUser}
          />
        )}
      </div>

      <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">ID</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          <DisplayNameWithBadge
            name={publicName}
            verified={profileIsVerified(profile as Profile)}
          />
        </p>
      </section>

      <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Bio</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          {profile.bio?.trim()
            ? profile.bio
            : "This student hasn't added a bio yet."}
        </p>
      </section>

      <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">History</h2>
          <div className="flex gap-3 text-sm">
            <Link
              href={`/profile/${id}`}
              className={
                !showSold
                  ? "font-medium text-[#003262] dark:text-[#FDB515]"
                  : "text-zinc-500"
              }
            >
              Active
            </Link>
            <Link
              href={`/profile/${id}?tab=sold`}
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
        ) : activeItems.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No active listings.</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {activeItems.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                supabaseUrl={supabaseUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
