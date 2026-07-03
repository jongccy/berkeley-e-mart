import type { User } from "@supabase/supabase-js";
import { isBerkeleyEmail } from "@/lib/auth";

/** Logged-in user with a Berkeley email (e.g. Google OAuth). */
export function isAuthenticatedBerkeleyUser(user: User | null): boolean {
  if (!user?.email) return false;
  return isBerkeleyEmail(user.email);
}

function hasGoogleIdentity(user: User): boolean {
  if (user.app_metadata?.provider === "google") return true;
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes("google")) return true;
  return (
    Array.isArray(user.identities) &&
    user.identities.some((identity) => identity.provider === "google")
  );
}

/** Berkeley email plus confirmed email or Google OAuth sign-in. */
export function isVerifiedBerkeleyUser(user: User | null): boolean {
  if (!isAuthenticatedBerkeleyUser(user)) return false;
  if (user!.email_confirmed_at) return true;
  return hasGoogleIdentity(user!);
}
