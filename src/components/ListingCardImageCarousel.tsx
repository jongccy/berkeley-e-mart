"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { SafeListingImage } from "@/components/SafeListingImage";

export type ListingCardImage = {
  id: string;
  url: string;
};

type Props = {
  images: ListingCardImage[];
  alt: string;
  href: string;
};

export function ListingCardImageCarousel({ images, alt, href }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const count = images.length;
  const hasMultiple = count > 1;
  const active = images[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex((index + count) % count);
    },
    [count]
  );

  if (!active) {
    return (
      <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
        <div className="flex h-full items-center justify-center text-zinc-400">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
      <Link href={href} className="relative block h-full w-full">
        <SafeListingImage
          src={active.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(activeIndex - 1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/65 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goTo(activeIndex + 1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/65 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            aria-label="Next photo"
          >
            <ChevronIcon direction="right" />
          </button>

          <div
            className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1"
            aria-hidden
          >
            {images.map((image, index) => (
              <span
                key={image.id}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  index === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6 6-6" />
      )}
    </svg>
  );
}
