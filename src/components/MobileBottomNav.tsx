"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessagingOptional } from "@/components/messaging/MessagingProvider";

const TABS = [
  {
    href: "/browse",
    label: "Browse",
    emoji: "🔎",
    match: (p: string) =>
      p === "/browse" ||
      p.startsWith("/browse/") ||
      (p.startsWith("/listings/") &&
        p !== "/listings/new" &&
        !p.endsWith("/edit")),
  },
  {
    href: "/wanted",
    label: "Requests",
    emoji: "🙋",
    match: (p: string) => p === "/wanted" || p.startsWith("/wanted/"),
  },
  {
    href: "/listings/new",
    label: "Sell",
    emoji: "➕",
    match: (p: string) => p === "/listings/new",
  },
  {
    href: "/inbox",
    label: "Inbox",
    emoji: "💬",
    match: (p: string) => p === "/inbox" || p.startsWith("/inbox/"),
  },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const messaging = useMessagingOptional();
  const unreadCount = messaging?.unreadCount ?? 0;

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] w-[min(100%-1.5rem,24rem)] rounded-full border border-zinc-200/90 bg-white/95 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-950/95">
        <ul className="grid grid-cols-4 gap-0.5">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const isInbox = tab.href === "/inbox";

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`relative flex flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-center transition ${
                    active
                      ? "text-[#003262] dark:text-[#FDB515]"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={
                    isInbox && unreadCount > 0
                      ? `Inbox, ${unreadCount} unread`
                      : tab.label
                  }
                >
                  <span className="relative text-lg leading-none" aria-hidden>
                    {tab.emoji}
                    {isInbox && unreadCount > 0 && (
                      <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-semibold leading-tight ${
                      active ? "opacity-100" : "opacity-90"
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
