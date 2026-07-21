"use client";

import { CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

type Props = {
  className?: string;
};

export function NavSearch({ className = "" }: Props) {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [open, setOpen] = useState(false);

  const hasFilters = Boolean(category || minPrice || maxPrice);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function browseHref() {
    const params = new URLSearchParams();
    const query = q.trim();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    const search = params.toString();
    return search ? `/browse?${search}` : "/browse";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    router.push(browseHref());
  }

  function clearFilters() {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  }

  function applyFilters() {
    setOpen(false);
    router.push(browseHref());
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 flex-1 ${className}`}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex w-full min-w-0 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-2.5 pr-2 shadow-sm transition focus-within:border-[#003262] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003262]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-[#FDB515] dark:focus-within:ring-[#FDB515]/20"
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
            open || hasFilters
              ? "bg-[#003262]/10 text-[#003262] dark:bg-[#FDB515]/15 dark:text-[#FDB515]"
              : "text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
          aria-label="Open search filters"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <FilterLinesIcon />
          {hasFilters && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FDB515]" />
          )}
        </button>

        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for any product..."
          className="min-w-0 flex-1 bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          aria-label="Search listings"
        />

        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003262] text-white transition hover:bg-[#002244] dark:bg-[#FDB515] dark:text-[#003262] dark:hover:bg-[#ffe08a]"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </form>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Search filters"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
        >
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-[#003262] focus:ring-2 focus:ring-[#003262]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-[#FDB515]"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Min price
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-[#003262] focus:ring-2 focus:ring-[#003262]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-[#FDB515]"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Max price
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-[#003262] focus:ring-2 focus:ring-[#003262]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-[#FDB515]"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-full bg-[#003262] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002244] dark:bg-[#FDB515] dark:text-[#003262] dark:hover:bg-[#ffe08a]"
            >
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterLinesIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
    >
      <path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
