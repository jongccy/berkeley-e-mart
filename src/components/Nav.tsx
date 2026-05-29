import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[#003262]">
          Berkeley E-Mart
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Browse
          </Link>
          <Link href="/wanted" className="hover:underline">
            Requests
          </Link>
          {user ? (
            <>
              <Link href="/listings/new" className="hover:underline">
                Sell
              </Link>
              <Link href="/inbox" className="hover:underline">
                Inbox
              </Link>
              <Link href="/profile/me" className="hover:underline">
                Profile
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-zinc-500 hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#003262] px-3 py-1 text-white hover:bg-[#002244]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
