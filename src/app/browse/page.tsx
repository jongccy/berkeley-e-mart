import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import { CATEGORIES, HOUSING_CATEGORY } from "@/lib/constants";
import { applyListingCategoryFilter } from "@/lib/listing-filters";
import {
  appendHousingFilterParams,
  applyHousingListingFilters,
  isHousingCategorySelected,
  type HousingFilterParams,
} from "@/lib/housing-browse-filters";
import { HousingBrowseFilters } from "@/components/HousingBrowseFilters";
import { SortMenu } from "@/components/SortMenu";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Listings",
  description:
    "Browse textbooks, furniture, electronics, free items, and housing leases from UC Berkeley students on Calket.",
  alternates: {
    // Ignore filter/sort query variants for SEO — one canonical browse URL.
    canonical: "/browse",
  },
  openGraph: {
    title: "Browse Listings",
    description:
      "Browse campus listings from verified Berkeley students on Calket.",
    url: "/browse",
  },
};

const PAGE_SIZE = 18;

type SortKey = "recent" | "price_asc" | "price_desc";

type SearchParams = HousingFilterParams & {
  q?: string;
  category?: string | string[];
  min_price?: string;
  max_price?: string;
  rating?: string;
  sort?: string;
  limit?: string;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Build an href to /browse with the current params, applying overrides. */
function buildHref(params: SearchParams, overrides: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  const merged: SearchParams = { ...params, ...overrides };

  if (merged.q) search.set("q", merged.q);
  for (const cat of toArray(merged.category)) search.append("category", cat);
  if (merged.min_price) search.set("min_price", merged.min_price);
  if (merged.max_price) search.set("max_price", merged.max_price);
  if (merged.rating) search.set("rating", merged.rating);
  if (merged.sort && merged.sort !== "recent") search.set("sort", merged.sort);
  if (merged.limit) search.set("limit", merged.limit);
  appendHousingFilterParams(search, merged);

  const query = search.toString();
  return query ? `/browse?${query}` : "/browse";
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  await expireSoldListings(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const selectedCategories = toArray(params.category);
  const minRating = parseInt(params.rating ?? "", 10);
  const sort: SortKey =
    params.sort === "price_asc" || params.sort === "price_desc"
      ? params.sort
      : "recent";

  const parsedLimit = parseInt(params.limit ?? "", 10);
  const displayLimit =
    Number.isFinite(parsedLimit) && parsedLimit >= PAGE_SIZE
      ? parsedLimit
      : PAGE_SIZE;

  const soldCutoff = getSoldListingCutoffIso();

  let query = supabase
    .from("listings")
    .select(
      `*, listing_images(*), profiles:seller_id(${PROFILE_IDENTITY_SELECT})`,
      { count: "exact" }
    )
    .or(`status.eq.active,and(status.eq.sold,sold_at.gte.${soldCutoff})`)
    .limit(displayLimit + 1);

  if (sort === "price_asc") {
    query = query.order("price_cents", { ascending: true, nullsFirst: false });
  } else if (sort === "price_desc") {
    query = query.order("price_cents", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (selectedCategories.length > 0) {
    query = applyListingCategoryFilter(query, selectedCategories);
  }
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }
  if (params.min_price) {
    query = query.gte("price_cents", parseInt(params.min_price, 10) * 100);
  }
  if (params.max_price) {
    query = query.lte("price_cents", parseInt(params.max_price, 10) * 100);
  }
  if (Number.isFinite(minRating) && minRating >= 1) {
    query = query.gte("quality_rating", minRating);
  }
  query = applyHousingListingFilters(query, params, selectedCategories);

  const { data: listings, count } = await query;
  const fetched = (listings ?? []) as ListingWithImages[];
  const hasMore = fetched.length > displayLimit;
  const items = hasMore ? fetched.slice(0, displayLimit) : fetched;

  const likedIds = await getLikedListingIds(supabase, user?.id);
  const showLike = Boolean(user && isAuthenticatedBerkeleyUser(user));
  const resultCount = count ?? items.length;
  const housingFiltersVisible = isHousingCategorySelected(selectedCategories);
  const housingOnlySelected =
    selectedCategories.length === 1 &&
    selectedCategories[0] === HOUSING_CATEGORY;

  const fieldClass =
    "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-[#003262] focus:ring-2 focus:ring-[#003262]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-[#FDB515]";

  return (
    <div className="bg-white dark:bg-zinc-950">
      <section className="border-b border-zinc-100 px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Browse Posts
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Search campus listings from Berkeley affiliates.
          </p>

          <form method="get" action="/browse" className="mt-6 max-w-2xl">
            {selectedCategories.map((cat) => (
              <input key={cat} type="hidden" name="category" value={cat} />
            ))}
            {params.min_price && (
              <input type="hidden" name="min_price" value={params.min_price} />
            )}
            {params.max_price && (
              <input type="hidden" name="max_price" value={params.max_price} />
            )}
            {params.rating && (
              <input type="hidden" name="rating" value={params.rating} />
            )}
            {sort !== "recent" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            {params.min_beds && (
              <input type="hidden" name="min_beds" value={params.min_beds} />
            )}
            {params.min_baths && (
              <input type="hidden" name="min_baths" value={params.min_baths} />
            )}
            {params.min_sqft && (
              <input type="hidden" name="min_sqft" value={params.min_sqft} />
            )}
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1.5 pl-5 shadow-sm transition focus-within:border-[#003262] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003262]/15">
              <input
                name="q"
                type="search"
                placeholder="Search listings..."
                defaultValue={params.q ?? ""}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#003262] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002244]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl justify-end px-4 py-3 sm:px-8">
        <SortMenu
          activeValue={sort}
          options={SORT_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
            href: buildHref(params, {
              sort: opt.value,
              limit: undefined,
            }),
          }))}
        />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-10 sm:px-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <form
            method="get"
            action="/browse"
            className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {params.q && <input type="hidden" name="q" value={params.q} />}
            {sort !== "recent" && <input type="hidden" name="sort" value={sort} />}

            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#003262] dark:text-[#FDB515]">
                Filters
              </h2>
              <Link
                href="/browse"
                className="text-xs text-zinc-400 transition hover:text-[#003262] dark:hover:text-[#FDB515]"
              >
                Clear
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {housingOnlySelected ? "Rent ($/month)" : "Price"}
              </p>
              <div className="flex items-center gap-2">
                <input
                  name="min_price"
                  type="number"
                  min="0"
                  placeholder="Min"
                  defaultValue={params.min_price ?? ""}
                  className={fieldClass}
                />
                <span className="text-zinc-400">–</span>
                <input
                  name="max_price"
                  type="number"
                  min="0"
                  placeholder="Max"
                  defaultValue={params.max_price ?? ""}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Category
              </p>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      name="category"
                      value={cat.value}
                      defaultChecked={selectedCategories.includes(cat.value)}
                      className="h-4 w-4 rounded border-zinc-300 accent-[#003262]"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>

            <HousingBrowseFilters
              mode="checkbox"
              initialHousingSelected={housingFiltersVisible}
              values={params}
              fieldClass={fieldClass}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Item condition
              </p>
              <div className="space-y-1.5">
                {[
                  { value: "", label: "Any condition" },
                  { value: "4", label: "★ 4 & up" },
                  { value: "3", label: "★ 3 & up" },
                  { value: "2", label: "★ 2 & up" },
                ].map((opt) => (
                  <label
                    key={opt.value || "any"}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={opt.value}
                      defaultChecked={(params.rating ?? "") === opt.value}
                      className="h-4 w-4 border-zinc-300 accent-[#003262]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#003262] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002244]"
            >
              Apply filters
            </button>
          </form>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <p className="text-sm text-zinc-500">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </p>

          {items.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">
              Nothing matches those filters. Try a broader price range or a
              different category.
            </p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    supabaseUrl={supabaseUrl}
                    showLike={showLike}
                    loggedIn={showLike}
                    liked={likedIds.has(listing.id)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Link
                    href={buildHref(params, {
                      limit: String(displayLimit + PAGE_SIZE),
                    })}
                    className="rounded-full bg-[#003262] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002244]"
                  >
                    See more
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
