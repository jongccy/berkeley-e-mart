/** Matches user@berkeley.edu and user@haas.berkeley.edu */
const BERKELEY_EMAIL_REGEX = /^[^@\s]+@([a-z0-9-]+\.)*berkeley\.edu$/i;

export function isBerkeleyEmail(email: string): boolean {
  return BERKELEY_EMAIL_REGEX.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
