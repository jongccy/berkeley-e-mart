import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/ChatThread";
import type { Message } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/inbox/${conversationId}`);

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, listings(id, title)")
    .eq("id", conversationId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const listingRaw = conversation.listings as
    | { id: string; title: string }
    | { id: string; title: string }[]
    | null;
  const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div>
        <Link href="/inbox" className="text-sm text-[#003262] underline">
          ← Back to inbox
        </Link>
        <h1 className="mt-2 text-xl font-bold">
          {listing?.title ?? "Conversation"}
        </h1>
        {listing && (
          <Link
            href={`/listings/${listing.id}`}
            className="text-sm text-zinc-500 underline"
          >
            View listing
          </Link>
        )}
      </div>
      <ChatThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={(messages ?? []) as Message[]}
      />
    </div>
  );
}
