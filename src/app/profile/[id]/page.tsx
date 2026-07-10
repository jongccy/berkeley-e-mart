import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileStat } from "@/components/ProfileStat";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { BlockUserButton } from "@/components/BlockUserButton";
import {
  resolvePublicName,
  resolveProfileHandle,
  profileIsVerified,
} from "@/lib/profile-display";
import { viewerHasBlockedUser } from "@/lib/user-blocks";
import {
  countArchivedSoldListings,
  expireSoldListings,
} from "@/lib/expire-sold-listings";
import { formatArchivedSoldCount, getSoldListingCutoffIso } from "@/lib/sold-listings";
import type { ListingWithImages, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

type Tab = "listings" | "reviews";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
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

  const tab: Tab = tabParam === "reviews" ? "reviews" : "listings";
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

  const { count: totalSoldCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", id)
    .eq("status", "sold");
  const transactions = totalSoldCount ?? 0;

  const isOwnProfile = user?.id === id;
  const hasBlockedUser =
    user && !isOwnProfile
      ? await viewerHasBlockedUser(supabase, user.id, id)
      : false;
  const publicName = resolvePublicName(profile as Profile);
  const handle = resolveProfileHandle(profile as Profile);
  const verified = profileIsVerified(profile as Profile);
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <ProfileAvatar avatarUrl={profile.avatar_url} alt={publicName} />
        <h1 className="mt-2 text-2xl font-bold">
          <DisplayNameWithBadge name={publicName} verified={verified} />
        </h1>
        {verified && (
          <span className="text-xs font-semibold uppercase tracking-wide text-[#003262] dark:text-[#FDB515]">
            Berkeley Verified
          </span>
        )}
        <p className="text-sm text-zinc-500">@{handle}</p>
        <p className="mt-1 text-sm text-zinc-500">Member since {memberSince}</p>

        {isOwnProfile && (
          <Link
            href="/profile/me"
            className="mt-1 text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
          >
            Edit profile
          </Link>
        )}
        {user && !isOwnProfile && (
          <div className="mt-1">
            <BlockUserButton blockedUserId={id} initialBlocked={hasBlockedUser} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 py-5 dark:border-zinc-800 sm:grid-cols-4">
        <ProfileStat value="—" label="Avg Rating" />
        <ProfileStat value={0} label="Reviews" />
        <ProfileStat value={transactions} label="Transactions" />
        <ProfileStat value={activeItems.length} label="Active Listings" />
      </div>

      {/* Bio */}
      {profile.bio?.trim() && (
        <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold">Bio</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
            {profile.bio}
          </p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href={`/profile/${id}`}
          className={`-mb-px border-b-2 pb-2 text-sm font-medium ${
            tab === "listings"
              ? "border-[#003262] text-[#003262] dark:border-[#FDB515] dark:text-[#FDB515]"
              : "border-transparent text-zinc-500"
          }`}
        >
          Listings ({activeItems.length})
        </Link>
        <Link
          href={`/profile/${id}?tab=reviews`}
          className={`-mb-px border-b-2 pb-2 text-sm font-medium ${
            tab === "reviews"
              ? "border-[#003262] text-[#003262] dark:border-[#FDB515] dark:text-[#FDB515]"
              : "border-transparent text-zinc-500"
          }`}
        >
          Reviews (0)
        </Link>
      </div>

      {tab === "reviews" ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-8">
          {activeItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No active listings.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeItems.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  supabaseUrl={supabaseUrl}
                />
              ))}
            </div>
          )}

          {(recentSoldItems.length > 0 || archivedSoldCount > 0) && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Recently sold
              </h2>
              {recentSoldItems.length > 0 && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {recentSoldItems.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      supabaseUrl={supabaseUrl}
                    />
                  ))}
                </div>
              )}
              {archivedSoldCount > 0 && (
                <p className="mt-3 text-sm text-zinc-500">
                  {formatArchivedSoldCount(archivedSoldCount)}
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
