import type { ListingStatus } from "@/types/database";

export const SOLD_LISTING_TTL_MS = 24 * 60 * 60 * 1000;

export function getSoldListingCutoffIso(): string {
  return new Date(Date.now() - SOLD_LISTING_TTL_MS).toISOString();
}

export function isSoldListingVisible(soldAt: string | null | undefined): boolean {
  if (!soldAt) return false;
  return new Date(soldAt).getTime() > Date.now() - SOLD_LISTING_TTL_MS;
}

export function formatArchivedSoldCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"} sold`;
}

/** In chat history, sold listings stay "sold" even after they are archived. */
export function resolveChatListingStatus(
  status: ListingStatus,
  soldAt: string | null | undefined
): ListingStatus {
  if (status === "sold") return "sold";
  if (status === "removed" && soldAt) return "sold";
  return status;
}
