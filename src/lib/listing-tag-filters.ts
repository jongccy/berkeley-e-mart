import { LISTING_TAG_SUGGESTIONS, normalizeListingTags } from "@/lib/tags";

type TagFilterQuery = {
  contains: (column: string, value: string[]) => TagFilterQuery;
};

export function parseListingTagParams(
  value: string | string[] | undefined
): string[] {
  return normalizeListingTags(
    Array.isArray(value) ? value : value ? [value] : []
  );
}

export function appendListingTagParams(
  search: URLSearchParams,
  tags: string[]
): void {
  for (const tag of tags) {
    search.append("tag", tag);
  }
}

export function applyListingTagFilter<T extends TagFilterQuery>(
  query: T,
  selectedTags: string[]
): T {
  if (selectedTags.length === 0) return query;
  // PostgREST `contains` maps to `@>` — listing must include every selected tag.
  return query.contains("tags", selectedTags) as T;
}

export function tagEquals(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function isTagSelected(selectedTags: string[], tag: string): boolean {
  return selectedTags.some((selected) => tagEquals(selected, tag));
}

/** Merge trending tags with preset suggestions for filter UIs. */
export function buildBrowseTagOptions(
  trending: { tag: string; use_count: number }[],
  selectedTags: string[] = [],
  presetLimit = 8
): { tag: string; useCount: number | null; trending: boolean }[] {
  const options: { tag: string; useCount: number | null; trending: boolean }[] =
    [];
  const seen = new Set<string>();

  for (const row of trending) {
    const key = row.tag.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    options.push({
      tag: row.tag,
      useCount: row.use_count,
      trending: true,
    });
  }

  for (const tag of LISTING_TAG_SUGGESTIONS) {
    if (options.length >= trending.length + presetLimit) break;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ tag, useCount: null, trending: false });
  }

  // Keep any already-selected custom tags visible even if they fell off trending.
  for (const tag of selectedTags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ tag, useCount: null, trending: false });
  }

  return options;
}
