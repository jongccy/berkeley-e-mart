import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ListingCard";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { getLikedListingIds } from "@/lib/listing-likes";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { getSoldListingCutoffIso } from "@/lib/sold-listings";
import { PROFILE_IDENTITY_SELECT } from "@/lib/profile-display";
import { CATEGORIES } from "@/lib/constants";
import type { ListingWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

type SortKey = "recent" | "price_asc" | "price_desc";

type SearchParams = {
  q?: string;
  category?: string | string[];
  min_price?: string;
  max_price?: string;
  has_photos?: string;
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
  if (merged.has_photos) search.set("has_photos", merged.has_photos);
  if (merged.rating) search.set("rating", merged.rating);
  if (merged.sort && merged.sort !== "recent") search.set("sort", merged.sort);
  if (merged.limit) search.set("limit", merged.limit);

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
  const hasPhotos = params.has_photos === "on";
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
  const imagesJoin = hasPhotos ? "listing_images!inner(*)" : "listing_images(*)";

  let query = supabase
    .from("listings")
    .select(
      `*, ${imagesJoin}, profiles:seller_id(${PROFILE_IDENTITY_SELECT})`,
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

  if (selectedCategories.length === 1) {
    query = query.eq("category", selectedCategories[0]);
  } else if (selectedCategories.length > 1) {
    query = query.in("category", selectedCategories);
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

  const { data: listings, count } = await query;
  const fetched = (listings ?? []) as ListingWithImages[];
  const hasMore = fetched.length > displayLimit;
  const items = hasMore ? fetched.slice(0, displayLimit) : fetched;

  const likedIds = await getLikedListingIds(supabase, user?.id);
  const showLike = Boolean(user && isAuthenticatedBerkeleyUser(user));
  const resultCount = count ?? items.length;

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#FDB515] focus:ring-1 focus:ring-[#FDB515] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <>
      {/* Hero */}
      <section className="bg-[#003262] px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Browse Posts</h1>

          <form method="get" action="/browse" className="mt-6 max-w-2xl">
            {/* preserve active filters when searching */}
            {selectedCategories.map((cat) => (
              <input key={cat} type="hidden" name="category" value={cat} />
            ))}
            {params.min_price && (
              <input type="hidden" name="min_price" value={params.min_price} />
            )}
            {params.max_price && (
              <input type="hidden" name="max_price" value={params.max_price} />
            )}
            {hasPhotos && <input type="hidden" name="has_photos" value="on" />}
            {params.rating && (
              <input type="hidden" name="rating" value={params.rating} />
            )}
            {sort !== "recent" && (
              <input type="hidden" name="sort" value={sort} />
            )}
            <div className="flex items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-lg">
              <input
                name="q"
                type="search"
                placeholder="Search listings..."
                defaultValue={params.q ?? ""}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#003262] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002244]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Sort */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-2">
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map((opt) => {
              const isActive = sort === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buildHref(params, {
                    sort: opt.value,
                    limit: undefined,
                  })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-[#003262] text-white"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <form
            method="get"
            action="/browse"
            className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {params.q && <input type="hidden" name="q" value={params.q} />}
            {sort !== "recent" && <input type="hidden" name="sort" value={sort} />}

            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#003262] dark:text-[#FDB515]">
                Filters
              </h2>
              <Link
                href="/browse"
                className="text-xs text-zinc-400 hover:text-[#003262] dark:hover:text-[#FDB515]"
              >
                Clear
              </Link>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                name="has_photos"
                defaultChecked={hasPhotos}
                className="h-4 w-4 rounded border-zinc-300 accent-[#003262]"
              />
              Has photos
            </label>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Price
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

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Minimum rating
              </p>
              <div className="space-y-1.5">
                {[
                  { value: "", label: "Any rating" },
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
              className="w-full rounded-lg bg-[#003262] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002244]"
            >
              Apply filters
            </button>
          </form>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1 space-y-6">
          <p className="text-sm text-zinc-500">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </p>

          {items.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">
              No listings match your search or filters.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                    className="rounded-lg bg-[#003262] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#002244]"
                  >
                    See more
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
