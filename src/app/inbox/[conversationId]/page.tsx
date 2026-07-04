import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markConversationRead } from "@/lib/inbox-unread";
import { ChatThread } from "@/components/ChatThread";
import { ReportButton } from "@/components/ReportButton";
import { BlockUserButton } from "@/components/BlockUserButton";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import {
  ConversationListingHeader,
  getListingHeaderImageUrl,
} from "@/components/ConversationListingHeader";
import { resolveChatListingStatus } from "@/lib/sold-listings";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  resolveSellerDisplayName,
  profileIsVerified,
} from "@/lib/profile-display";
import type { ListingStatus, Message } from "@/types/database";
import {
  usersAreBlocked,
  viewerHasBlockedUser,
  BLOCKED_MESSAGING_MESSAGE,
} from "@/lib/user-blocks";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/inbox/${conversationId}`);

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      *,
      listings(id, title, price_cents, status, sold_at, listing_images(storage_path, sort_order)),
      buyer:buyer_id(${PROFILE_IDENTITY_SELECT}),
      seller:seller_id(${PROFILE_IDENTITY_SELECT})
    `
    )
    .eq("id", conversationId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single();

  if (!conversation) notFound();

  await markConversationRead(supabase, user.id, conversationId);
  revalidatePath("/", "layout");

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const listingRaw = conversation.listings as
    | {
        id: string;
        title: string;
        price_cents: number | null;
        status: ListingStatus;
        sold_at: string | null;
        listing_images: { storage_path: string; sort_order: number }[];
      }
    | {
        id: string;
        title: string;
        price_cents: number | null;
        status: ListingStatus;
        sold_at: string | null;
        listing_images: { storage_path: string; sort_order: number }[];
      }[]
    | null;
  const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;

  const buyerRaw = conversation.buyer as
    | {
        id: string;
        display_name: string | null;
        show_real_name: boolean;
        marketplace_alias: string | null;
        is_verified_berkeley: boolean;
      }
    | {
        id: string;
        display_name: string | null;
        show_real_name: boolean;
        marketplace_alias: string | null;
        is_verified_berkeley: boolean;
      }[];
  const buyer = Array.isArray(buyerRaw) ? buyerRaw[0] : buyerRaw;

  const sellerRaw = conversation.seller as
    | {
        id: string;
        display_name: string | null;
        show_real_name: boolean;
        marketplace_alias: string | null;
        is_verified_berkeley: boolean;
      }
    | {
        id: string;
        display_name: string | null;
        show_real_name: boolean;
        marketplace_alias: string | null;
        is_verified_berkeley: boolean;
      }[];
  const seller = Array.isArray(sellerRaw) ? sellerRaw[0] : sellerRaw;

  const isBuyer = buyer.id === user.id;
  const otherParty = isBuyer ? seller : buyer;
  const otherPartyName = isBuyer
    ? resolveSellerDisplayName(seller)
    : resolvePublicName(buyer);
  const otherPartyVerified = profileIsVerified(isBuyer ? seller : buyer);
  const messagingBlocked = await usersAreBlocked(supabase, user.id, otherParty.id);
  const hasBlockedOtherParty = await viewerHasBlockedUser(
    supabase,
    user.id,
    otherParty.id
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/inbox" className="text-sm text-[#003262] underline">
          ← Back to inbox
        </Link>
        <div className="flex items-center gap-3">
          <BlockUserButton
            blockedUserId={otherParty.id}
            initialBlocked={hasBlockedOtherParty}
          />
          <ReportButton
            kind="user"
            reportedUserId={otherParty.id}
            listingId={listing?.id}
            conversationId={conversationId}
            label="Report user"
          />
        </div>
      </div>

      {listing ? (
        <ConversationListingHeader
          listingId={listing.id}
          title={listing.title}
          priceCents={listing.price_cents}
          imageUrl={getListingHeaderImageUrl(
            supabaseUrl,
            listing.listing_images
          )}
          otherPartyName={otherPartyName}
          otherPartyVerified={otherPartyVerified}
          listingStatus={resolveChatListingStatus(
            listing.status,
            listing.sold_at
          )}
        />
      ) : (
        <div>
          <h1 className="text-xl font-bold">Conversation</h1>
          <p className="text-sm text-zinc-500">
            Chat with{" "}
            <DisplayNameWithBadge
              name={otherPartyName}
              verified={otherPartyVerified}
            />
          </p>
        </div>
      )}

      <ChatThread
        key={conversationId}
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={(messages ?? []) as Message[]}
        messagingDisabled={messagingBlocked}
        messagingDisabledMessage={BLOCKED_MESSAGING_MESSAGE}
      />
    </div>
  );
}
