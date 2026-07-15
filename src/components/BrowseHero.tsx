import { CalketLogo } from "@/components/CalketLogo";
import { HousingBrowseFilters } from "@/components/HousingBrowseFilters";
import { CATEGORIES, HOUSING_CATEGORY } from "@/lib/constants";
import {
  isHousingCategorySelected,
  type HousingFilterParams,
} from "@/lib/housing-browse-filters";

type SearchParams = HousingFilterParams & {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
};

type Props = {
  searchParams: SearchParams;
};

const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#FDB515] focus:ring-1 focus:ring-[#FDB515] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function BrowseHero({ searchParams }: Props) {
  const housingSelected = isHousingCategorySelected(
    searchParams.category ? [searchParams.category] : []
  );
  const priceLabel = housingSelected ? "Min $/mo" : "Min $";

  return (
    <section className="bg-[#003262] px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <CalketLogo href={false} height={240} rounded="rounded-3xl" />

        <p className="max-w-2xl text-center text-base text-white/90 sm:text-lg">
          Calket is the marketplace built just for Cal. Buy and sell with the <span className="text-[#FDB515]">Bear community</span>{" "}.
        </p>

        <form
          method="get"
          action="/browse"
          className="w-full max-w-3xl space-y-4 rounded-2xl border-2 border-[#003262] bg-white p-4 shadow-lg sm:p-5"
        >
          <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white p-2 pl-5 focus-within:border-[#FDB515] focus-within:ring-1 focus-within:ring-[#FDB515]">
            <input
              name="q"
              type="search"
              placeholder="Search listings..."
              defaultValue={searchParams.q ?? ""}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#003262] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002244]"
            >
              Browse
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <select
              name="category"
              defaultValue={searchParams.category ?? ""}
              className={fieldClass}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              name="min_price"
              type="number"
              min="0"
              step="1"
              placeholder={priceLabel}
              defaultValue={searchParams.min_price ?? ""}
              className={fieldClass}
            />
            <input
              name="max_price"
              type="number"
              min="0"
              step="1"
              placeholder={housingSelected ? "Max $/mo" : "Max $"}
              defaultValue={searchParams.max_price ?? ""}
              className={fieldClass}
            />
          </div>

          <HousingBrowseFilters
            mode="select"
            initialHousingSelected={searchParams.category === HOUSING_CATEGORY}
            values={searchParams}
            fieldClass={fieldClass}
          />
        </form>
      </div>
    </section>
  );
}
