"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import { isMessageUnread } from "@/lib/inbox-unread";
import { resolveChatListingStatus } from "@/lib/sold-listings";
import { resolvePublicName, resolveSellerDisplayName, profileIsVerified } from "@/lib/profile-display";
import { useMessaging } from "@/components/messaging/MessagingProvider";
import { SoldListingOverlay } from "@/components/SoldListingOverlay";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingThumbnail } from "@/components/ListingThumbnail";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { getListingHeaderImageUrl } from "@/components/ConversationListingHeader";
import type { ListingStatus, Message } from "@/types/database";

export type InboxConversationItem = {
  id: string;
  lastMessageAt: string;
  listing: {
    id: string;
    title: string;
    sellerId: string;
    status: ListingStatus;
    soldAt: string | null;
    listingImages: { storage_path: string; sort_order: number }[];
  } | null;
  buyer: {
    id: string;
    display_name: string | null;
    show_real_name: boolean;
    marketplace_alias: string | null;
    is_verified_berkeley: boolean;
  };
  seller: {
    id: string;
    display_name: string | null;
    show_real_name: boolean;
    marketplace_alias: string | null;
    is_verified_berkeley: boolean;
  };
  lastMessage?: {
    body: string;
    sender_id: string;
    created_at: string;
  };
  lastReadAt?: string;
};

type Props = {
  userId: string;
  supabaseUrl: string;
  conversations: InboxConversationItem[];
};

export function InboxConversationList({
  userId,
  supabaseUrl,
  conversations: initialConversations,
}: Props) {
  const { registerInboxHandler } = useMessaging();
  const [conversations, setConversations] = useState(initialConversations);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    return registerInboxHandler((message: Message) => {
      setConversations((current) => {
        const index = current.findIndex((c) => c.id === message.conversation_id);
        if (index === -1) return current;

        const updated = [...current];
        const conversation = updated[index];
        updated[index] = {
          ...conversation,
          lastMessageAt: message.created_at,
          lastMessage: {
            body: message.body,
            sender_id: message.sender_id,
            created_at: message.created_at,
          },
        };

        updated.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );

        return updated;
      });
    });
  }, [registerInboxHandler]);

  const rows = useMemo(() => conversations, [conversations]);

  if (rows.length === 0) {
    return (
      <p className="text-zinc-500">
        No conversations yet. Message someone from a listing or request page.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {rows.map((c) => {
        const isBuyer = c.buyer.id === userId;
        const otherName = isBuyer
          ? resolveSellerDisplayName(c.seller)
          : resolvePublicName(c.buyer);
        const otherVerified = profileIsVerified(isBuyer ? c.seller : c.buyer);
        const threadTitle = c.listing?.title ?? "Conversation";
        const listingStatus = c.listing
          ? resolveChatListingStatus(c.listing.status, c.listing.soldAt)
          : null;
        const listingImageUrl = c.listing
          ? getListingHeaderImageUrl(supabaseUrl, c.listing.listingImages)
          : null;
        const unread = isMessageUnread(c.lastMessage, userId, c.lastReadAt);
        const isSoldThread = listingStatus === "sold";

        return (
          <li
            key={c.id}
            className={`flex items-start gap-3 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
              unread ? "bg-[#003262]/5" : ""
            }${isSoldThread ? " relative" : ""}`}
          >
            {isSoldThread && <SoldListingOverlay />}
            {c.listing ? (
              <Link
                href={`/listings/${c.listing.id}`}
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
                  <p
                    className={`font-medium ${unread ? "text-[#003262]" : ""}`}
                  >
                    {threadTitle}
                  </p>
                  {unread && (
                    <span
                      className="h-2 w-2 rounded-full bg-[#003262]"
                      aria-hidden
                    />
                  )}
                  {listingStatus && (
                    <ListingStatusBadge status={listingStatus} />
                  )}
                </div>
                <p className="text-sm text-zinc-500">
                  with{" "}
                  <DisplayNameWithBadge
                    name={otherName}
                    verified={otherVerified}
                  />
                </p>
                {c.lastMessage ? (
                  <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                    {c.lastMessage.sender_id === userId ? "You: " : ""}
                    {c.lastMessage.body}
                  </p>
                ) : (
                  <p className="mt-1 text-sm italic text-zinc-400">
                    No messages yet
                  </p>
                )}
              </Link>
              {c.listing ? (
                <Link
                  href={`/listings/${c.listing.id}`}
                  className="mt-1 inline-block text-xs font-medium text-[#003262] underline dark:text-[#FDB515]"
                >
                  View listing
                </Link>
              ) : null}
            </div>
            <span className="relative z-[2] shrink-0 text-xs text-zinc-400">
              {formatRelativeTime(c.lastMessageAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
