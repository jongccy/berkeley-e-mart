import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { isBerkeleyEmail } from "@/lib/auth";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export function VerifyBanner({ user }: { user: User | null }) {
  if (!user) return null;
  if (isVerifiedBerkeleyUser(user)) return null;

  if (!isBerkeleyEmail(user.email ?? "")) {
    return (
      <div className="bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
        Only @berkeley.edu accounts are supported. Please sign up with your
        Berkeley email.
      </div>
    );
  }

  return (
    <div className="bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
      Verify your Berkeley email to create listings, post requests, and message
      sellers.{" "}
      <Link href="/profile/me" className="font-medium underline">
        Check profile
      </Link>
    </div>
  );
}
