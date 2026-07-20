import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  InboxConversationList,
  type InboxConversationItem,
} from "@/components/InboxConversationList";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import { getBlockRelatedUserIds } from "@/lib/user-blocks";
import type { ListingStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default async function InboxPage() {
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/inbox");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id,
      last_message_at,
      listings(id, title, seller_id, status, sold_at, listing_images(storage_path, sort_order)),
      buyer:buyer_id(${PROFILE_IDENTITY_SELECT}),
      seller:seller_id(${PROFILE_IDENTITY_SELECT})
    `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationIds = conversations?.map((c) => c.id) ?? [];
  const lastMessageByConversation = new Map<
    string,
    { body: string; sender_id: string; created_at: string }
  >();

  if (conversationIds.length > 0) {
    const { data: messageRows } = await supabase
      .from("messages")
      .select("conversation_id, body, sender_id, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    for (const row of messageRows ?? []) {
      if (!lastMessageByConversation.has(row.conversation_id)) {
        lastMessageByConversation.set(row.conversation_id, row);
      }
    }
  }

  const { data: readRows } =
    conversationIds.length > 0
      ? await supabase
          .from("conversation_reads")
          .select("conversation_id, last_read_at")
          .eq("user_id", user.id)
          .in("conversation_id", conversationIds)
      : { data: [] };

  const lastReadByConversation = new Map(
    (readRows ?? []).map((row) => [row.conversation_id, row.last_read_at])
  );

  const blockRelatedUserIds = await getBlockRelatedUserIds(supabase);
  const visibleConversations = (conversations ?? []).filter((conversation) => {
    const buyerRaw = conversation.buyer as { id: string } | { id: string }[];
    const sellerRaw = conversation.seller as { id: string } | { id: string }[];
    const buyer = Array.isArray(buyerRaw) ? buyerRaw[0] : buyerRaw;
    const seller = Array.isArray(sellerRaw) ? sellerRaw[0] : sellerRaw;
    const otherId = buyer.id === user.id ? seller.id : buyer.id;
    return !blockRelatedUserIds.has(otherId);
  });

  const items: InboxConversationItem[] = visibleConversations.map((c) => {
    const listingRaw = c.listings as
      | {
          id: string;
          title: string;
          seller_id: string;
          status: ListingStatus;
          sold_at: string | null;
          listing_images: { storage_path: string; sort_order: number }[];
        }
      | {
          id: string;
          title: string;
          seller_id: string;
          status: ListingStatus;
          sold_at: string | null;
          listing_images: { storage_path: string; sort_order: number }[];
        }[]
      | null;
    const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;

    const buyerRaw = c.buyer as InboxConversationItem["buyer"] | InboxConversationItem["buyer"][];
    const buyer = Array.isArray(buyerRaw) ? buyerRaw[0] : buyerRaw;

    const sellerRaw = c.seller as InboxConversationItem["seller"] | InboxConversationItem["seller"][];
    const seller = Array.isArray(sellerRaw) ? sellerRaw[0] : sellerRaw;

    return {
      id: c.id,
      lastMessageAt: c.last_message_at,
      listing: listing
        ? {
            id: listing.id,
            title: listing.title,
            sellerId: listing.seller_id,
            status: listing.status,
            soldAt: listing.sold_at,
            listingImages: listing.listing_images,
          }
        : null,
      buyer,
      seller,
      lastMessage: lastMessageByConversation.get(c.id),
      lastReadAt: lastReadByConversation.get(c.id),
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
      <InboxConversationList
        userId={user.id}
        supabaseUrl={supabaseUrl}
        conversations={items}
      />
    </div>
  );
}
