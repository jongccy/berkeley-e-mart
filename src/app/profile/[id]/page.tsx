import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
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

  const showSold = tab === "sold";
  const statusFilter = showSold ? "sold" : "active";

  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("seller_id", id)
    .eq("status", statusFilter)
    .order("created_at", { ascending: false });

  const items = (listings ?? []) as ListingWithImages[];
  const isOwnProfile = user?.id === id;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#003262] text-2xl text-white">
              {(profile.display_name ?? "B")[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {(profile as Profile).display_name ?? "Berkeley Student"}
            </h1>
            {profile.bio && (
              <p className="mt-1 max-w-lg text-zinc-600 dark:text-zinc-400">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
        {isOwnProfile && (
          <Link
            href="/profile/me"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700"
          >
            Edit profile
          </Link>
        )}
      </div>

      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href={`/profile/${id}`}
          className={`border-b-2 px-2 py-2 text-sm ${
            !showSold
              ? "border-[#003262] font-medium"
              : "border-transparent text-zinc-500"
          }`}
        >
          Active listings
        </Link>
        <Link
          href={`/profile/${id}?tab=sold`}
          className={`border-b-2 px-2 py-2 text-sm ${
            showSold
              ? "border-[#003262] font-medium"
              : "border-transparent text-zinc-500"
          }`}
        >
          Sold history
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-zinc-500">
          {showSold ? "No sold listings yet." : "No active listings."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              supabaseUrl={supabaseUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
