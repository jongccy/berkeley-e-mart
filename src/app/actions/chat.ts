"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import type { Message } from "@/types/database";

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

export async function startWantedConversation(wantedPostId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    redirect(`/login?redirect=/wanted/${wantedPostId}`);
  }

  const { data: post, error: postError } = await supabase
    .from("wanted_posts")
    .select("id, user_id, status")
    .eq("id", wantedPostId)
    .single();

  if (postError || !post) {
    return { error: "Request not found." };
  }

  if (post.status !== "open") {
    return { error: "This request is closed." };
  }

  if (post.user_id === user.id) {
    return { error: "You cannot message yourself." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("wanted_post_id", wantedPostId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/inbox/${existing.id}`);
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      wanted_post_id: wantedPostId,
      buyer_id: user.id,
      seller_id: post.user_id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/inbox/${conversation.id}`);
}

export async function startListingConversation(
  listingId: string,
  initialMessage: string
): Promise<{ error?: string; conversationId?: string }> {
  const message = initialMessage.trim();
  if (!message) {
    return { error: "Write a message before sending." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { error: "Sign in with your Berkeley Google account to message." };
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.status === "sold") {
    return { error: "This item is sold." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot message yourself." };
  }

  let conversationId: string | null = null;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) {
    conversationId = existing.id;
  } else {
    const { data: conversation, error: convoError } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
      })
      .select("id")
      .single();

    if (convoError?.code === "23505") {
      const { data: raced } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("buyer_id", user.id)
        .maybeSingle();
      conversationId = raced?.id ?? null;
    } else if (convoError || !conversation) {
      return { error: convoError?.message ?? "Could not start conversation." };
    } else {
      conversationId = conversation.id;
    }
  }

  if (!conversationId) {
    return { error: "Could not start conversation." };
  }

  const { data: insertedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: message,
    })
    .select()
    .single();

  if (messageError || !insertedMessage) {
    return { error: messageError?.message ?? "Could not send message." };
  }

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${conversationId}`);

  return { conversationId };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ error?: string; message?: Message }> {
  const text = body.trim();
  if (!text) return { error: "Message cannot be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isVerifiedBerkeleyUser(user)) {
    return { error: "Verify your Berkeley email to send messages." };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: text,
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not send message." };

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${conversationId}`);

  return { message: data as Message };
}
