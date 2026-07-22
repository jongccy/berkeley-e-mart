import { expandSearchTerms, normalizeToken } from "@/lib/search-synonyms";

type TextFilterQuery = {
  or: (filters: string) => TextFilterQuery;
};

const MAX_FTS_TERMS = 24;
const MAX_ILIKE_LEN = 64;

/** Strip characters that break PostgREST filter / websearch parsing. */
export function sanitizeSearchInput(raw: string): string {
  return raw
    .replace(/[%_,.()'"\\]/g, " ")
    .replace(/[^\p{L}\p{N}\s+\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Quote a PostgREST .or() filter value that may contain spaces. */
function quoteFilterValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Build a websearch_to_tsquery-friendly string from expanded terms.
 * Example: "macbook OR laptop OR computer"
 */
export function buildWebsearchQuery(terms: string[]): string {
  const cleaned = terms
    .map((t) => normalizeToken(t))
    .filter((t) => t.length >= 2)
    .slice(0, MAX_FTS_TERMS);

  const unique = Array.from(new Set(cleaned));
  if (unique.length === 0) return "";

  // Quote multi-word phrases for websearch; single tokens stay bare.
  return unique
    .map((term) => (term.includes(" ") ? `"${term}"` : term))
    .join(" OR ");
}

/**
 * Apply synonym-expanded full-text search, with a substring fallback on the
 * original phrase so short prefixes (e.g. "mac") still match.
 */
export function applyListingTextSearch<T extends TextFilterQuery>(
  query: T,
  rawQ: string
): T {
  const sanitized = sanitizeSearchInput(rawQ);
  if (!sanitized) return query;

  const terms = expandSearchTerms(sanitized);
  const ftsQuery = buildWebsearchQuery(terms);
  const phrase = escapeIlike(sanitized.slice(0, MAX_ILIKE_LEN));

  const parts: string[] = [];

  if (ftsQuery) {
    parts.push(`search_vector.wfts(english).${quoteFilterValue(ftsQuery)}`);
  }

  if (phrase.length >= 2) {
    parts.push(`title.ilike.%${phrase}%`);
    parts.push(`description.ilike.%${phrase}%`);
  }

  if (parts.length === 0) return query;

  return query.or(parts.join(",")) as T;
}
