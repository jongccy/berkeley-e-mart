/** Matches user@berkeley.edu and user@haas.berkeley.edu */
const BERKELEY_EMAIL_REGEX = /^[^@\s]+@([a-z0-9-]+\.)*berkeley\.edu$/i;

export const TERMS_ACKNOWLEDGED_COOKIE = "terms_acknowledged";

export function isBerkeleyEmail(email: string): boolean {
  return BERKELEY_EMAIL_REGEX.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Public production origin — never the *.vercel.app deployment host. */
export const CANONICAL_SITE_URL = "https://calket.org";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!configured) {
    return process.env.NODE_ENV === "production"
      ? CANONICAL_SITE_URL
      : "http://localhost:3000";
  }
  // Avoid baking the Vercel URL into auth/email links once a custom domain exists.
  if (configured.includes(".vercel.app")) {
    return CANONICAL_SITE_URL;
  }
  return configured;
}
