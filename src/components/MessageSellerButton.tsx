"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startListingConversation } from "@/app/actions/chat";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import {
  LISTING_MESSAGE_TEMPLATES,
  priceOfferTemplate,
} from "@/lib/message-templates";
import type { ListingStatus } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type Props = {
  listingId: string;
  sellerId: string;
  user: User | null;
  status: ListingStatus;
  priceLabel: string;
  existingConversationId: string | null;
};

export function MessageSellerButton({
  listingId,
  sellerId,
  user,
  status,
  priceLabel,
  existingConversationId,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (status === "sold") {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-800"
      >
        This item is sold
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?redirect=/listings/${listingId}`}
        className="inline-block w-full rounded-lg bg-[#003262] px-4 py-2.5 text-center font-medium text-white hover:bg-[#002244]"
      >
        Log in to message seller
      </Link>
    );
  }

  if (user.id === sellerId) {
    return <p className="text-sm text-zinc-500">This is your listing.</p>;
  }

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Sign in with your Berkeley Google account to message the seller.
      </p>
    );
  }

  if (existingConversationId) {
    return (
      <Link
        href={`/inbox/${existingConversationId}`}
        className="inline-block w-full rounded-lg bg-[#003262] px-4 py-2.5 text-center font-medium text-white hover:bg-[#002244]"
      >
        Continue conversation
      </Link>
    );
  }

  async function handleSend() {
    const text = message.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");

    try {
      const result = await startListingConversation(listingId, text);

      if (result.error) {
        setError(result.error);
        setSending(false);
        return;
      }

      if (result.conversationId) {
        setOpen(false);
        router.push(`/inbox/${result.conversationId}`);
        router.refresh();
        return;
      }

      setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setMessage(LISTING_MESSAGE_TEMPLATES[0]);
        }}
        className="w-full rounded-lg bg-[#003262] px-4 py-2.5 font-medium text-white hover:bg-[#002244]"
      >
        Message seller
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Message seller</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Edit the message below or pick another quick reply.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {LISTING_MESSAGE_TEMPLATES.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setMessage(template)}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-left text-sm hover:border-[#003262] dark:border-zinc-700"
                >
                  {template}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMessage(priceOfferTemplate(priceLabel))}
                className="rounded-full border border-zinc-300 px-3 py-1 text-left text-sm hover:border-[#003262] dark:border-zinc-700"
              >
                {priceOfferTemplate(priceLabel)}
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your message..."
              className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 rounded-lg bg-[#003262] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#002244] disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
