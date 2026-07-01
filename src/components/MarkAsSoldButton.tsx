"use client";

import { useState } from "react";

type Props = {
  action: () => Promise<void>;
};

export function MarkAsSoldButton({ action }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#FDB515] px-4 py-2 text-sm font-medium text-[#003262]"
      >
        Mark as sold
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Mark this item as sold?</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your listing will stay up for <strong>24 hours</strong>, then it
              will come down automatically.
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
                className="flex-1 rounded-lg bg-[#FDB515] px-4 py-2.5 text-sm font-medium text-[#003262]"
              >
                Mark as sold
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
