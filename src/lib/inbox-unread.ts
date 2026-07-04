import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUnreadInboxCount(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase.rpc("get_unread_inbox_count");

  if (error) {
    console.error("get_unread_inbox_count failed:", error.message);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

export async function markConversationRead(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
): Promise<void> {
  const { error } = await supabase.from("conversation_reads").upsert(
    {
      user_id: userId,
      conversation_id: conversationId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,conversation_id" }
  );

  if (error) {
    console.error("markConversationRead failed:", error.message);
  }
}

export function isMessageUnread(
  lastMessage:
    | { sender_id: string; created_at: string }
    | undefined,
  currentUserId: string,
  lastReadAt: string | undefined
): boolean {
  if (!lastMessage) return false;
  if (lastMessage.sender_id === currentUserId) return false;
  if (!lastReadAt) return true;
  return new Date(lastMessage.created_at) > new Date(lastReadAt);
}
