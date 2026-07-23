"use client";

import { useRouter } from "next/navigation";

export type MessageToastItem = {
  id: string;
  conversationId: string;
  senderName: string;
  body: string;
};

type Props = {
  toasts: MessageToastItem[];
  onDismiss: (id: string) => void;
};

function truncateBody(body: string, maxLength = 100): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function MessageToastStack({ toasts, onDismiss }: Props) {
  const router = useRouter();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-4 right-4 z-[100] flex justify-center md:bottom-4 md:left-auto md:right-4 md:justify-end"
      aria-live="polite"
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => {
              onDismiss(toast.id);
              router.push(`/inbox/${toast.conversationId}`);
            }}
            className="pointer-events-auto w-full rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-lg transition hover:border-[#003262]/30 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-sm font-semibold text-[#003262] dark:text-[#FDB515]">
              New message from {toast.senderName}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
              {truncateBody(toast.body)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
