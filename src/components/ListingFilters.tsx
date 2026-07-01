import { CATEGORIES } from "@/lib/constants";

type SearchParams = {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
};

export function ListingFilters({ searchParams }: { searchParams: SearchParams }) {
  return (
    <form
      method="get"
      action="/"
      className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-2 lg:grid-cols-5"
    >
      <input
        name="q"
        type="search"
        placeholder="Search listings..."
        defaultValue={searchParams.q ?? ""}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm lg:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <select
        name="category"
        defaultValue={searchParams.category ?? ""}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
        placeholder="Min $"
        defaultValue={searchParams.min_price ?? ""}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <input
        name="max_price"
        type="number"
        min="0"
        step="1"
        placeholder="Max $"
        defaultValue={searchParams.max_price ?? ""}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#003262] px-4 py-2 text-sm font-medium text-white hover:bg-[#002244] lg:col-span-5 lg:max-w-xs"
      >
        Apply filters
      </button>
    </form>
  );
}
