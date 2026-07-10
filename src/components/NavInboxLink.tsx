"use client";

import Link from "next/link";
import { useMessaging } from "@/components/messaging/MessagingProvider";

export function NavInboxLink() {
  const { unreadCount } = useMessaging();

  return (
    <Link
      href="/inbox"
      className="relative inline-flex items-center gap-1.5 hover:underline"
      aria-label={
        unreadCount > 0 ? `Inbox, ${unreadCount} unread` : "Inbox"
      }
    >
      Inbox
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
