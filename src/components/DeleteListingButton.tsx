"use client";

import { useState } from "react";

type Props = {
  action: () => Promise<void>;
  variant?: "default" | "inline";
};

export function DeleteListingButton({ action, variant = "default" }: Props) {
  const [open, setOpen] = useState(false);

  const triggerClassName =
    variant === "inline"
      ? "text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400"
      : "rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Take down this listing?</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This listing will be removed from browse and will no longer be
              visible to other users.
            </p>

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
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete listing
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
