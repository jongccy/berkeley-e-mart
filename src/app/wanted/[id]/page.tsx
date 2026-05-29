import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { closeWantedPost } from "@/app/actions/wanted";
import { formatPrice, formatListingType } from "@/lib/format";

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
    .select("*, profiles:user_id(id, display_name)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const profile = post.profiles as { id: string; display_name: string | null };
  const isOwner = user?.id === post.user_id;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <Link href="/wanted" className="text-sm text-[#003262] underline">
        ← All requests
      </Link>
      <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
        {formatListingType(post.type)}
      </span>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-sm text-zinc-500">
        Posted by{" "}
        <Link href={`/profile/${profile.id}`} className="underline">
          {profile.display_name ?? "Student"}
        </Link>
        · {post.status}
      </p>
      <p className="font-medium">Max budget: {formatPrice(post.max_price_cents)}</p>
      <p className="whitespace-pre-wrap">{post.description}</p>

      {isOwner && post.status === "open" && (
        <form action={closeWantedPost.bind(null, id)}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Mark as closed
          </button>
        </form>
      )}

      {user && user.id !== post.user_id && (
        <p className="text-sm text-zinc-500">
          Interested? Browse{" "}
          <Link href="/" className="underline">
            listings
          </Link>{" "}
          or message the requester from their profile listings.
        </p>
      )}
    </div>
  );
}
