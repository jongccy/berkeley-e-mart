import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatCategory } from "@/lib/format";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
} from "@/lib/profile-display";
import type { WantedPost } from "@/types/database";

export const dynamic = "force-dynamic";

type WantedPostWithProfile = WantedPost & {
  profiles: {
    id: string;
    display_name: string | null;
    show_real_name: boolean;
    marketplace_alias: string | null;
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
              className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {formatCategory(post.category)}
                </span>
              </div>
              <h2 className="mt-1 font-medium">{post.title}</h2>
              {showRequester && (
                <p className="mt-1 text-sm text-zinc-500">
                  Posted by {requesterName}
                </p>
              )}
              <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {post.description}
              </p>
              <p className="mt-2 text-sm font-medium">
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
  const myRequests = user
    ? items.filter((post) => post.user_id === user.id)
    : [];
  const otherRequests = user
    ? items.filter((post) => post.user_id !== user.id)
    : items;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Looking for</h1>
          <p className="text-sm text-zinc-500">
            Requests from students seeking items across campus.
          </p>
        </div>
        {user && (
          <Link
            href="/wanted/new"
            className="rounded-lg bg-[#003262] px-4 py-2 text-sm text-white hover:bg-[#002244]"
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
              emptyMessage="You haven't posted any open requests yet."
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
            emptyMessage="No open requests from other students yet."
          />
        </section>
      </div>
    </div>
  );
}
