import { getSiteUrl } from "@/lib/auth";
import {
  getEmailFromAddress,
  getResendClient,
  isEmailConfigured,
} from "@/lib/email/client";
import {
  PROFILE_IDENTITY_SELECT,
  resolvePublicName,
  resolveSellerDisplayName,
  type ProfilePublicIdentity,
} from "@/lib/profile-display";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type NotifyParams = {
  conversationId: string;
  senderId: string;
  messageBody: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function truncatePreview(body: string, maxLength = 160): string {
  const singleLine = body.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength - 1)}…`;
}

function unwrapProfile(
  value: ProfilePublicIdentity | ProfilePublicIdentity[] | null | undefined
): ProfilePublicIdentity | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function resolveSenderName(
  senderId: string,
  sellerId: string,
  buyer: ProfilePublicIdentity | null,
  seller: ProfilePublicIdentity | null
): string {
  if (senderId === sellerId) {
    return resolveSellerDisplayName(seller);
  }
  return resolvePublicName(buyer);
}

export async function notifyNewMessageRecipient({
  conversationId,
  senderId,
  messageBody,
}: NotifyParams): Promise<void> {
  if (!isEmailConfigured()) return;

  const resend = getResendClient();
  const from = getEmailFromAddress();
  if (!resend || !from) return;

  const supabase = createServiceRoleClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select(
      `
      id,
      buyer_id,
      seller_id,
      listings(title),
      wanted_posts(title),
      buyer:buyer_id(${PROFILE_IDENTITY_SELECT}),
      seller:seller_id(${PROFILE_IDENTITY_SELECT})
    `
    )
    .eq("id", conversationId)
    .single();

  if (conversationError || !conversation) {
    throw new Error(conversationError?.message ?? "Conversation not found.");
  }

  const recipientId =
    conversation.buyer_id === senderId
      ? conversation.seller_id
      : conversation.buyer_id;

  const { data: recipientAuth, error: recipientError } =
    await supabase.auth.admin.getUserById(recipientId);

  if (recipientError || !recipientAuth.user?.email) {
    throw new Error(recipientError?.message ?? "Recipient email not found.");
  }

  const listingRaw = conversation.listings as { title: string } | { title: string }[] | null;
  const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;

  const wantedRaw = conversation.wanted_posts as
    | { title: string }
    | { title: string }[]
    | null;
  const wantedPost = Array.isArray(wantedRaw) ? wantedRaw[0] : wantedRaw;

  const threadLabel =
    listing?.title?.trim() ||
    wantedPost?.title?.trim() ||
    "your Calket conversation";

  const buyer = unwrapProfile(
    conversation.buyer as ProfilePublicIdentity | ProfilePublicIdentity[] | null
  );
  const seller = unwrapProfile(
    conversation.seller as ProfilePublicIdentity | ProfilePublicIdentity[] | null
  );
  const senderName = resolveSenderName(
    senderId,
    conversation.seller_id,
    buyer,
    seller
  );

  const preview = truncatePreview(messageBody);
  const threadUrl = `${getSiteUrl()}/inbox/${conversationId}`;

  const { error: sendError } = await resend.emails.send({
    from,
    to: recipientAuth.user.email,
    subject: `New message from ${senderName} on Calket`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #18181b; max-width: 32rem;">
        <p style="margin: 0 0 1rem;">
          <strong>${escapeHtml(senderName)}</strong> sent you a message about
          <strong>${escapeHtml(threadLabel)}</strong>:
        </p>
        <blockquote style="margin: 0 0 1.25rem; padding: 0.75rem 1rem; border-left: 3px solid #003262; background: #f4f4f5;">
          ${escapeHtml(preview)}
        </blockquote>
        <p style="margin: 0;">
          <a href="${threadUrl}" style="color: #003262; font-weight: 600;">
            Open conversation on Calket
          </a>
        </p>
        <p style="margin: 1.25rem 0 0; font-size: 0.875rem; color: #71717a;">
          You are receiving this because someone messaged you on Calket.
        </p>
      </div>
    `,
  });

  if (sendError) {
    throw new Error(sendError.message);
  }
}

export async function tryNotifyNewMessageRecipient(
  params: NotifyParams
): Promise<void> {
  try {
    await notifyNewMessageRecipient(params);
  } catch (error) {
    console.error("new message email failed:", error);
  }
}
