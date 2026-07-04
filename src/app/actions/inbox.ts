"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markConversationRead } from "@/lib/inbox-unread";

export async function markConversationReadAction(
  conversationId: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await markConversationRead(supabase, user.id, conversationId);
  revalidatePath("/", "layout");
}
