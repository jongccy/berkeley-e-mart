import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatCategory } from "@/lib/format";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  profileIsVerified,
} from "@/lib/profile-display";
import { getBlockRelatedUserIds } from "@/lib/user-blocks";
import type { WantedPost } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Requests",
  description:
    "See what UC Berkeley students are looking for and respond to open requests on Calket.",
  alternates: {
    canonical: "/wanted",
  },
  openGraph: {
    title: "Requests",
    description:
      "Browse open requests from Berkeley students looking to buy items on campus.",
    url: "/wanted",
  },
};

type WantedPostWithProfile = WantedPost & {
  profiles: {
    id: string;
    display_name: string | null;
    show_real_name: boolean;
    marketplace_alias: string | null;
    is_verified_berkeley: boolean;
  } | null;
};

function WantedPostList({
  posts,
  showRequester,
  emptyMessage,
}: {
  posts: WantedPostWithProfile[];
  showRequester: boolean;
  emptyMessage: string;
}) {
  if (!posts.length) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const requesterName = resolvePublicName(post.profiles);

        return (
          <li key={post.id}>
            <Link
              href={`/wanted/${post.id}`}
              className="block rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-[#003262]/25 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#003262]/8 px-2.5 py-0.5 text-xs font-medium text-[#003262] dark:bg-[#FDB515]/15 dark:text-[#FDB515]">
                  {formatCategory(post.category)}
                </span>
              </div>
              <h2 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
                {post.title}
              </h2>
              {showRequester && (
                <p className="mt-1 text-sm text-zinc-500">
                  Posted by{" "}
                  <DisplayNameWithBadge
                    name={requesterName}
                    verified={profileIsVerified(post.profiles)}
                  />
                </p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {post.description}
              </p>
              <p className="mt-3 text-sm font-bold text-[#003262] dark:text-[#FDB515]">
                Max: {formatPrice(post.max_price_cents)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function WantedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("wanted_posts")
    .select(`*, profiles:user_id(${PROFILE_IDENTITY_SELECT})`)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);

  const items = (posts ?? []) as WantedPostWithProfile[];
  const blockRelatedUserIds = user
    ? await getBlockRelatedUserIds(supabase)
    : new Set<string>();
  const visibleItems = items.filter(
    (post) => !blockRelatedUserIds.has(post.user_id)
  );
  const myRequests = user
    ? visibleItems.filter((post) => post.user_id === user.id)
    : [];
  const otherRequests = user
    ? visibleItems.filter((post) => post.user_id !== user.id)
    : visibleItems;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Looking for
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Requests from students seeking items across campus.
          </p>
        </div>
        {user && (
          <Link
            href="/wanted/new"
            className="rounded-full bg-[#003262] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002244]"
          >
            Post a request
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {user && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Your requests</h2>
            <WantedPostList
              posts={myRequests}
              showRequester={false}
              emptyMessage="You haven't posted a request yet. Ask for something and other students can reach out."
            />
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {user ? "From other students" : "Open requests"}
          </h2>
          <WantedPostList
            posts={otherRequests}
            showRequester
            emptyMessage="No open requests from other students right now. Check back soon."
          />
        </section>
      </div>
    </div>
  );
}
