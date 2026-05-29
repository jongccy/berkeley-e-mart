import type { User } from "@supabase/supabase-js";
import { isBerkeleyEmail } from "@/lib/auth";

export function isVerifiedBerkeleyUser(user: User | null): boolean {
  if (!user?.email) return false;
  return (
    isBerkeleyEmail(user.email) &&
    Boolean(user.email_confirmed_at)
  );
}
