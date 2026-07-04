import { FREE_CATEGORY } from "@/lib/constants";

type CategoryFilterQuery = {
  eq: (column: string, value: string) => CategoryFilterQuery;
  in: (column: string, values: string[]) => CategoryFilterQuery;
  or: (filters: string) => CategoryFilterQuery;
};

export function applyListingCategoryFilter<T extends CategoryFilterQuery>(
  query: T,
  selectedCategories: string[]
): T {
  if (selectedCategories.length === 0) return query;

  const includesFree = selectedCategories.includes(FREE_CATEGORY);
  const nonFreeCategories = selectedCategories.filter(
    (category) => category !== FREE_CATEGORY
  );

  if (includesFree && nonFreeCategories.length === 0) {
    return query.or(`category.eq.${FREE_CATEGORY},price_cents.eq.0`) as T;
  }

  if (includesFree) {
    const categories = [...nonFreeCategories, FREE_CATEGORY].join(",");
    return query.or(`category.in.(${categories}),price_cents.eq.0`) as T;
  }

  if (selectedCategories.length === 1) {
    return query.eq("category", selectedCategories[0]) as T;
  }

  return query.in("category", selectedCategories) as T;
}
