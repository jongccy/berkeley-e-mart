export const LISTING_TAG_SUGGESTIONS = [
  "Price negotiable",
  "Cheap furniture",
  "Never used",
  "Like new",
  "Gently used",
  "Must go today",
  "Pickup only",
  "Can deliver",
  "Bundle deal",
  "Best offer",
  "Student discount",
  "Moving sale",
  "Includes accessories",
  "Warranty included",
  "Smoke-free home",
  "Pet-free home",
  "Firm price",
  "Urgent sale",
  "Campus pickup",
] as const;

export const MAX_LISTING_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

export function normalizeListingTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of raw) {
    const tag = value.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key) || tags.length >= MAX_LISTING_TAGS) continue;

    seen.add(key);
    tags.push(tag);
  }

  return tags;
}
