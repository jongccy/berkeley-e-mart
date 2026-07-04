"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import {
  blockUserFromForm,
  unblockUser,
  type BlockFormState,
} from "@/app/actions/blocks";

type Props = {
  blockedUserId: string;
  initialBlocked: boolean;
  label?: string;
  className?: string;
};

export function BlockUserButton({
  blockedUserId,
  initialBlocked,
  label,
  className = "",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [optimisticBlocked, setOptimisticBlocked] = useState<boolean | null>(
    null
  );
  const [unblockPending, setUnblockPending] = useState(false);
  const [unblockError, setUnblockError] = useState("");
  const [state, formAction, pending] = useActionState<BlockFormState, FormData>(
    blockUserFromForm,
    {}
  );

  const blocked =
    optimisticBlocked ?? (state.blocked !== undefined ? state.blocked : initialBlocked);

  const buttonClass =
    className ||
    "text-sm font-medium text-zinc-500 underline hover:text-red-600";

  async function handleUnblock() {
    setUnblockPending(true);
    setUnblockError("");

    const result = await unblockUser(blockedUserId);
    setUnblockPending(false);

    if (result.error) {
      setUnblockError(result.error);
      return;
    }

    setOptimisticBlocked(false);
    setOpen(false);
    router.refresh();
  }

  if (blocked) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
          {label ?? "Blocked"}
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
              <h2 className="text-lg font-semibold">Unblock this user?</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                They will be able to message you again and their listings will
                show up in your browse feed.
              </p>

              {unblockError && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                  {unblockError}
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
                  onClick={handleUnblock}
                  disabled={unblockPending}
                  className="flex-1 rounded-lg bg-[#003262] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#002244] disabled:opacity-60"
                >
                  {unblockPending ? "Unblocking..." : "Unblock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        {label ?? "Block user"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Block this user?</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You won&apos;t be able to message each other, and their listings
              will be hidden from your browse feed. You can unblock them later.
            </p>

            {state.success ? (
              <>
                <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                  User blocked.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOptimisticBlocked(true);
                    setOpen(false);
                    router.refresh();
                  }}
                  className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
                >
                  Close
                </button>
              </>
            ) : (
              <form action={formAction} className="mt-4 space-y-4">
                <input type="hidden" name="blocked_user_id" value={blockedUserId} />

                {state.error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    {state.error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? "Blocking..." : "Block user"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
