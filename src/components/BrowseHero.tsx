import { CalketLogo } from "@/components/CalketLogo";
import { CATEGORIES } from "@/lib/constants";

type SearchParams = {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
};

type Props = {
  searchParams: SearchParams;
};

const fieldClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#FDB515] focus:ring-1 focus:ring-[#FDB515]";

export function BrowseHero({ searchParams }: Props) {
  return (
    <section className="bg-[#003262] px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <CalketLogo href={false} height={240} rounded="rounded-3xl" />

        <form
          method="get"
          action="/"
          className="w-full max-w-3xl space-y-4 rounded-2xl border-2 border-[#003262] bg-white p-4 shadow-lg sm:p-5"
        >
          <div className="flex overflow-hidden rounded-full border border-zinc-300 focus-within:border-[#FDB515] focus-within:ring-1 focus-within:ring-[#FDB515]">
            <input
              name="q"
              type="search"
              placeholder="Search listings..."
              defaultValue={searchParams.q ?? ""}
              className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#003262] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#002244] sm:px-8"
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
              placeholder="Min $"
              defaultValue={searchParams.min_price ?? ""}
              className={fieldClass}
            />
            <input
              name="max_price"
              type="number"
              min="0"
              step="1"
              placeholder="Max $"
              defaultValue={searchParams.max_price ?? ""}
              className={fieldClass}
            />
          </div>
        </form>
      </div>
    </section>
  );
}
