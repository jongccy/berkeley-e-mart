"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markListingSoldFromConversation } from "@/app/actions/listings";

type Props = {
  action?: () => Promise<void>;
  conversationId?: string;
  variant?: "default" | "inline";
};

export function MarkAsSoldButton({
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
      : "rounded-lg bg-[#FDB515] px-4 py-2 text-sm font-medium text-[#003262]";

  const handleConversationMarkSold = async () => {
    if (!conversationId) return;

    setPending(true);
    setError(null);

    const result = await markListingSoldFromConversation(conversationId);

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  };

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
        Mark sold
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Mark this item as sold?</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your listing will stay up for <strong>24 hours</strong>, then it
              will come down automatically.
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
                  onClick={handleConversationMarkSold}
                  disabled={pending}
                  className="flex-1 rounded-lg bg-[#FDB515] px-4 py-2.5 text-sm font-medium text-[#003262] disabled:opacity-50"
                >
                  {pending ? "Marking…" : "Mark as sold"}
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
                  className="flex-1 rounded-lg bg-[#FDB515] px-4 py-2.5 text-sm font-medium text-[#003262]"
                >
                  Mark as sold
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
