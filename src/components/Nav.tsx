import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CalketLogo } from "@/components/CalketLogo";
import { NavProfileMenu } from "@/components/NavProfileMenu";

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
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <CalketLogo height={72} rounded="rounded-2xl" />
        <nav className="ml-auto flex shrink-0 items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-4 text-lg font-semibold text-[#003262] dark:text-[#FDB515]">
                <Link href="/browse" className="hover:underline">
                  Browse
                </Link>
                <span className="font-normal text-zinc-300 dark:text-zinc-600" aria-hidden>
                  |
                </span>
                <Link href="/wanted" className="hover:underline">
                  Requests
                </Link>
                <span className="font-normal text-zinc-300 dark:text-zinc-600" aria-hidden>
                  |
                </span>
                <Link href="/listings/new" className="hover:underline">
                  Sell
                </Link>
              </div>
              <NavProfileMenu avatarUrl={avatarUrl} />
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-full border border-[#003262] px-4 py-2 text-sm font-medium text-[#003262] hover:bg-[#003262]/5 dark:border-[#FDB515] dark:text-[#FDB515] dark:hover:bg-[#FDB515]/10"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#003262] px-4 py-2 text-sm font-medium text-white hover:bg-[#002244]"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
