import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { closeWantedPost } from "@/app/actions/wanted";
import { MessageRequesterButton } from "@/components/MessageRequesterButton";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { BlockUserButton } from "@/components/BlockUserButton";
import { formatPrice, formatCategory } from "@/lib/format";
import { SITE_NAME } from "@/lib/constants";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  profileIsVerified,
  sellerProfileIsPublic,
} from "@/lib/profile-display";
import { usersAreBlocked, viewerHasBlockedUser } from "@/lib/user-blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("wanted_posts")
    .select("title, description, category, max_price_cents, status")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    return {
      title: "Request not found",
      robots: { index: false, follow: false },
    };
  }

  const budget = formatPrice(post.max_price_cents);
  const categoryLabel = formatCategory(post.category);
  const description =
    post.description?.trim() ||
    `${post.title} — looking for ${categoryLabel} (max ${budget}) on ${SITE_NAME}.`;

  return {
    title: post.title,
    description: description.slice(0, 160),
    alternates: {
      canonical: `/wanted/${id}`,
    },
    openGraph: {
      title: post.title,
      description: description.slice(0, 160),
      url: `/wanted/${id}`,
    },
    robots:
      post.status === "open"
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}

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
    is_verified_berkeley: boolean;
  };
  const isOwner = user?.id === post.user_id;
  const requesterName = resolvePublicName(profile);
  const requesterVerified = profileIsVerified(profile);
  const messagingBlocked =
    user && !isOwner
      ? await usersAreBlocked(supabase, user.id, post.user_id)
      : false;
  const hasBlockedRequester =
    user && !isOwner
      ? await viewerHasBlockedUser(supabase, user.id, post.user_id)
      : false;
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
                <DisplayNameWithBadge
                  name={requesterName}
                  verified={requesterVerified}
                />
              </Link>
            ) : (
              <p className="mt-1 text-lg font-medium">
                <DisplayNameWithBadge
                  name={requesterName}
                  verified={requesterVerified}
                />
              </p>
            )}

            {user && !isOwner && (
              <div className="mt-3">
                <BlockUserButton
                  blockedUserId={post.user_id}
                  initialBlocked={hasBlockedRequester}
                />
              </div>
            )}

            {post.status === "open" && (
              <div className="mt-4">
                <MessageRequesterButton
                  wantedPostId={post.id}
                  requesterId={post.user_id}
                  user={user}
                  messagingBlocked={messagingBlocked}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
