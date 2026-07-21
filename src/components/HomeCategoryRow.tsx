import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export function HomeCategoryRow() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
          Browse categories
        </h2>
        <Link
          href="/browse"
          className="shrink-0 text-sm font-semibold text-[#003262] transition hover:opacity-70 dark:text-[#FDB515]"
        >
          View all →
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-2">
        {CATEGORIES.map((category, index) => (
          <Link
            key={category.value}
            href={`/browse?category=${encodeURIComponent(category.value)}`}
            className="home-category-enter group flex w-28 shrink-0 flex-col items-center gap-3"
            style={{ animationDelay: `${0.05 * index}s` }}
          >
            <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 transition group-hover:border-[#003262] group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
              <span className="px-3 text-center text-[11px] font-medium leading-snug text-zinc-400">
                Photo
                <br />
                placeholder
              </span>
            </span>
            <span className="text-center text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
