import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, FREE_CATEGORY, OTHER_CATEGORY } from "@/lib/constants";

const CATEGORY_IMAGES: Partial<Record<(typeof CATEGORIES)[number]["value"], string>> = {
  electronics: "/categories/electronics.png",
  furniture: "/categories/furniture.png",
  textbooks: "/categories/textbooks.png",
  housing: "/categories/housing.png",
  transportation: "/categories/transportation.png",
  appliances: "/categories/appliances.png",
  clothing: "/categories/clothing.png",
  tickets: "/categories/tickets-concert-v4.png",
};

const HOME_CATEGORIES = CATEGORIES.filter(
  (category) =>
    category.value !== FREE_CATEGORY && category.value !== OTHER_CATEGORY
);

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

      <div className="grid grid-cols-2 justify-items-center gap-y-6 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-2">
        {HOME_CATEGORIES.map((category, index) => {
          const imageSrc = CATEGORY_IMAGES[category.value];

          return (
            <Link
              key={category.value}
              href={`/browse?category=${encodeURIComponent(category.value)}`}
              className="home-category-enter group flex w-full max-w-[7.5rem] flex-col items-center gap-3"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 transition group-hover:border-[#003262] group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="112px"
                    className={
                      category.value === "tickets"
                        ? "object-contain object-center"
                        : "object-contain object-center p-2"
                    }
                  />
                ) : (
                  <span className="px-3 text-center text-[11px] font-medium leading-snug text-zinc-400">
                    Photo
                    <br />
                    placeholder
                  </span>
                )}
              </span>
              <span className="text-center text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
                {category.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
