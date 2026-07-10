"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markListingAvailableFromConversation } from "@/app/actions/listings";

type Props = {
  action?: () => Promise<void>;
  conversationId?: string;
  variant?: "default" | "inline";
};

export function MarkAsAvailableButton({
  action,
  conversationId,
  variant = "default",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerClassName =
    variant === "inline"
      ? "text-sm font-medium text-[#003262] underline hover:text-[#002244] dark:text-[#FDB515]"
      : "rounded-lg border border-[#003262] px-4 py-2 text-sm font-medium text-[#003262] hover:bg-[#003262]/5 dark:border-[#FDB515] dark:text-[#FDB515] dark:hover:bg-[#FDB515]/10";

  async function handleConversationRelist() {
    if (!conversationId) return;

    setPending(true);
    setError(null);

    const result = await markListingAvailableFromConversation(conversationId);

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={triggerClassName}
      >
        Mark available
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Mark this item as available?</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your listing will go back on the marketplace as active.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </p>
            )}

            {conversationId ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConversationRelist}
                  disabled={pending}
                  className="flex-1 rounded-lg bg-[#003262] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#002244] disabled:opacity-50"
                >
                  {pending ? "Updating…" : "Mark as available"}
                </button>
              </div>
            ) : (
              <form action={action} className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#003262] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#002244]"
                >
                  Mark as available
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
