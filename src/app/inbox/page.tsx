import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingThumbnail } from "@/components/ListingThumbnail";
import { getListingHeaderImageUrl } from "@/components/ConversationListingHeader";
import { resolveChatListingStatus } from "@/lib/sold-listings";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  resolveSellerDisplayName,
} from "@/lib/profile-display";
import type { ListingStatus } from "@/types/database";

export const dynamic = "force-dynamic";

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
    { body: string; sender_id: string }
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
      {!conversations?.length ? (
        <p className="text-zinc-500">
          No conversations yet. Message someone from a listing or request page.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {conversations.map((c) => {
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
            const listing = Array.isArray(listingRaw)
              ? listingRaw[0]
              : listingRaw;
            const buyerRaw = c.buyer as
              | {
                  id: string;
                  display_name: string | null;
                  show_real_name: boolean;
                  marketplace_alias: string | null;
                }
              | {
                  id: string;
                  display_name: string | null;
                  show_real_name: boolean;
                  marketplace_alias: string | null;
                }[];
            const buyer = Array.isArray(buyerRaw) ? buyerRaw[0] : buyerRaw;
            const sellerRaw = c.seller as
              | {
                  id: string;
                  display_name: string | null;
                  show_real_name: boolean;
                  marketplace_alias: string | null;
                }
              | {
                  id: string;
                  display_name: string | null;
                  show_real_name: boolean;
                  marketplace_alias: string | null;
                }[];
            const seller = Array.isArray(sellerRaw) ? sellerRaw[0] : sellerRaw;
            const isBuyer = buyer.id === user.id;
            const otherName = isBuyer
              ? resolveSellerDisplayName(seller)
              : resolvePublicName(buyer);
            const threadTitle = listing?.title ?? "Conversation";
            const listingStatus = listing
              ? resolveChatListingStatus(listing.status, listing.sold_at)
              : null;
            const listingImageUrl = listing
              ? getListingHeaderImageUrl(supabaseUrl, listing.listing_images)
              : null;
            const lastMessage = lastMessageByConversation.get(c.id);

            return (
              <li
                key={c.id}
                className="flex items-start gap-3 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {listing ? (
                  <Link
                    href={`/listings/${listing.id}`}
                    className="shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] dark:focus:ring-[#FDB515]"
                    aria-label={`View listing: ${threadTitle}`}
                  >
                    <ListingThumbnail
                      imageUrl={listingImageUrl}
                      alt={threadTitle}
                      size="xs"
                    />
                  </Link>
                ) : null}
                <div className="min-w-0 flex-1">
                  <Link href={`/inbox/${c.id}`} className="block">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{threadTitle}</p>
                      {listingStatus && (
                        <ListingStatusBadge status={listingStatus} />
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">with {otherName}</p>
                    {lastMessage ? (
                      <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {lastMessage.sender_id === user.id ? "You: " : ""}
                        {lastMessage.body}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm italic text-zinc-400">
                        No messages yet
                      </p>
                    )}
                  </Link>
                  {listing ? (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="mt-1 inline-block text-xs font-medium text-[#003262] underline dark:text-[#FDB515]"
                    >
                      View listing
                    </Link>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-zinc-400">
                  {formatRelativeTime(c.last_message_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
