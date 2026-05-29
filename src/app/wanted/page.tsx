import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatListingType } from "@/lib/format";
import type { WantedPost } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function WantedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("wanted_posts")
    .select("*, profiles:user_id(id, display_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Looking for</h1>
          <p className="text-sm text-zinc-500">
            Requests from students seeking items, services, or leases.
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

      {!posts?.length ? (
        <p className="text-zinc-500">No open requests yet.</p>
      ) : (
        <ul className="space-y-3">
          {(posts as WantedPost[]).map((post) => (
            <li key={post.id}>
              <Link
                href={`/wanted/${post.id}`}
                className="block rounded-xl border border-zinc-200 p-4 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    {formatListingType(post.type)}
                  </span>
                  <span className="text-xs text-zinc-500">{post.category}</span>
                </div>
                <h2 className="mt-1 font-medium">{post.title}</h2>
                <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                <p className="mt-2 text-sm font-medium">
                  Max: {formatPrice(post.max_price_cents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
