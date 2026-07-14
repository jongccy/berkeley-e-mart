"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type SortMenuOption = {
  value: string;
  label: string;
  href: string;
};

type Props = {
  options: SortMenuOption[];
  activeValue: string;
};

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3v10M5 3l-2 2M5 3l2 2M11 13V3M11 13l-2-2M11 13l2-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.2L4.8 8.5 9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SortMenu({ options, activeValue }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const activeLabel =
    options.find((opt) => opt.value === activeValue)?.label ?? "Sort";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#003262]/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 dark:focus:ring-[#FDB515]/30"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Sort by ${activeLabel}`}
      >
        <SortIcon className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
        Sort
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
        >
          {options.map((opt, index) => {
            const isActive = opt.value === activeValue;
            return (
              <Link
                key={opt.value}
                href={opt.href}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-6 px-4 py-3 text-sm text-zinc-800 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900 ${
                  index > 0
                    ? "border-t border-zinc-200 dark:border-zinc-700"
                    : ""
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                    isActive
                      ? "border-[#003262] bg-[#003262] text-white dark:border-[#FDB515] dark:bg-[#FDB515] dark:text-[#003262]"
                      : "border-zinc-400 bg-white dark:border-zinc-500 dark:bg-transparent"
                  }`}
                  aria-hidden="true"
                >
                  {isActive && <CheckIcon className="h-3 w-3" />}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
