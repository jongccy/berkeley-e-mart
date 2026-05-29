"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export async function startConversation(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    redirect(`/login?redirect=/listings/${listingId}`);
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot message yourself." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/inbox/${existing.id}`);
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/inbox/${conversation.id}`);
}

export async function sendMessage(conversationId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message cannot be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { error: "Verify your Berkeley email to send messages." };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) return { error: error.message };
  return { success: true };
}
