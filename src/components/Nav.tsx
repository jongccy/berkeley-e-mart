import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CalketLogo } from "@/components/CalketLogo";
import { NavInboxLink } from "@/components/NavInboxLink";
import { NavProfileMenu } from "@/components/NavProfileMenu";
import { NavSearch } from "@/components/NavSearch";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    avatarUrl =
      profile?.avatar_url ??
      (user.user_metadata?.avatar_url as string | undefined) ??
      null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-8">
        <CalketLogo height={68} rounded="rounded-xl" />

        <NavSearch className="mx-1 hidden sm:flex sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl" />

        <nav className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-3 text-sm font-semibold text-[#003262] md:flex dark:text-[#FDB515]">
                <Link href="/browse" className="transition hover:opacity-70">
                  Browse
                </Link>
                <Link href="/wanted" className="transition hover:opacity-70">
                  Requests
                </Link>
                <Link href="/listings/new" className="transition hover:opacity-70">
                  Sell
                </Link>
                <NavInboxLink />
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Link
                  href="/browse"
                  className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-[#003262] dark:text-[#FDB515]"
                >
                  Browse
                </Link>
                <NavInboxLink />
              </div>
              <NavProfileMenu avatarUrl={avatarUrl} />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#003262] transition hover:opacity-70 dark:text-[#FDB515]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#003262]/25 bg-[#003262]/5 dark:border-[#FDB515]/40 dark:bg-[#FDB515]/10">
                <ProfileIcon />
              </span>
              Sign In
            </Link>
          )}
        </nav>
      </div>

      <div className="border-t border-zinc-100 px-4 pb-3 pt-2 sm:hidden dark:border-zinc-800">
        <NavSearch />
      </div>
    </header>
  );
}

function ProfileIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        d="M5.5 19.5c1.8-3.2 4-4.8 6.5-4.8s4.7 1.6 6.5 4.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
