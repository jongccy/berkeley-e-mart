import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { closeWantedPost } from "@/app/actions/wanted";
import { MessageRequesterButton } from "@/components/MessageRequesterButton";
import { formatPrice, formatCategory } from "@/lib/format";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  sellerProfileIsPublic,
} from "@/lib/profile-display";

export const dynamic = "force-dynamic";

export default async function WantedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("wanted_posts")
    .select(`*, profiles:user_id(${PROFILE_IDENTITY_SELECT})`)
    .eq("id", id)
    .single();

  if (!post) notFound();

  const profile = post.profiles as {
    id: string;
    display_name: string | null;
    show_real_name: boolean;
    marketplace_alias: string | null;
  };
  const isOwner = user?.id === post.user_id;
  const requesterName = resolvePublicName(profile);
  const showRequesterProfile = sellerProfileIsPublic(profile) && !isOwner;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/wanted" className="text-sm text-[#003262] underline">
        ← All requests
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {formatCategory(post.category)}
          </span>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-sm text-zinc-500">{post.status}</p>
          <p className="text-xl font-semibold text-[#003262] dark:text-[#FDB515]">
            Max budget: {formatPrice(post.max_price_cents)}
          </p>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {post.description}
          </p>

          {isOwner && post.status === "open" && (
            <form action={closeWantedPost.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Mark as closed
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">Requester</p>
            {showRequesterProfile ? (
              <Link
                href={`/profile/${profile.id}`}
                className="mt-1 block text-lg font-medium hover:underline"
              >
                {requesterName}
              </Link>
            ) : (
              <p className="mt-1 text-lg font-medium">{requesterName}</p>
            )}

            {post.status === "open" && (
              <div className="mt-4">
                <MessageRequesterButton
                  wantedPostId={post.id}
                  requesterId={post.user_id}
                  user={user}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
