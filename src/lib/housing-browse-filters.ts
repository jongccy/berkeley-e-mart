import { HOUSING_CATEGORY } from "@/lib/constants";

export type HousingFilterParams = {
  min_beds?: string;
  min_baths?: string;
  min_sqft?: string;
};

type HousingFilterQuery = {
  gte: (column: string, value: number) => HousingFilterQuery;
  or: (filters: string) => HousingFilterQuery;
};

export function isHousingCategorySelected(categories: string[]): boolean {
  return categories.includes(HOUSING_CATEGORY);
}

function applyHousingConstraint<T extends HousingFilterQuery>(
  query: T,
  categories: string[],
  housingFilter: string,
  applyDirect: (q: T) => T
): T {
  if (!isHousingCategorySelected(categories)) return query;
  if (categories.length === 1 && categories[0] === HOUSING_CATEGORY) {
    return applyDirect(query);
  }
  return query.or(`category.neq.${HOUSING_CATEGORY},${housingFilter}`) as T;
}

export function applyHousingListingFilters<T extends HousingFilterQuery>(
  query: T,
  params: HousingFilterParams,
  selectedCategories: string[]
): T {
  if (!isHousingCategorySelected(selectedCategories)) return query;

  let next = query;

  const minBeds = parseInt(params.min_beds ?? "", 10);
  if (Number.isFinite(minBeds) && minBeds > 0) {
    next = applyHousingConstraint(
      next,
      selectedCategories,
      `bedrooms.gte.${minBeds}`,
      (q) => q.gte("bedrooms", minBeds) as T
    );
  }

  const minBaths = parseFloat(params.min_baths ?? "");
  if (Number.isFinite(minBaths) && minBaths > 0) {
    next = applyHousingConstraint(
      next,
      selectedCategories,
      `bathrooms.gte.${minBaths}`,
      (q) => q.gte("bathrooms", minBaths) as T
    );
  }

  const minSqft = parseInt(params.min_sqft ?? "", 10);
  if (Number.isFinite(minSqft) && minSqft > 0) {
    next = applyHousingConstraint(
      next,
      selectedCategories,
      `sqft.gte.${minSqft}`,
      (q) => q.gte("sqft", minSqft) as T
    );
  }

  return next;
}

export function appendHousingFilterParams(
  search: URLSearchParams,
  params: HousingFilterParams
): void {
  if (params.min_beds) search.set("min_beds", params.min_beds);
  if (params.min_baths) search.set("min_baths", params.min_baths);
  if (params.min_sqft) search.set("min_sqft", params.min_sqft);
}

const BED_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
] as const;

const BATH_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "1", label: "1+" },
  { value: "1.5", label: "1.5+" },
  { value: "2", label: "2+" },
  { value: "2.5", label: "2.5+" },
  { value: "3", label: "3+" },
] as const;

const SQFT_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "500", label: "500+ sqft" },
  { value: "750", label: "750+ sqft" },
  { value: "1000", label: "1,000+ sqft" },
  { value: "1500", label: "1,500+ sqft" },
  { value: "2000", label: "2,000+ sqft" },
] as const;

export const HOUSING_BED_FILTER_OPTIONS = BED_OPTIONS;
export const HOUSING_BATH_FILTER_OPTIONS = BATH_OPTIONS;
export const HOUSING_SQFT_FILTER_OPTIONS = SQFT_OPTIONS;
