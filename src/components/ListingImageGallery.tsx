"use client";

import { SafeListingImage } from "@/components/SafeListingImage";
import { useCallback, useEffect, useRef, useState } from "react";

export type ListingGalleryImage = {
  id: string;
  url: string;
};

type Props = {
  images: ListingGalleryImage[];
  alt: string;
};

export function ListingImageGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  if (!active) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        No photos
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <SafeListingImage
          src={active.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIndex === 0}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/65"
              aria-label="Previous photo"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/65"
              aria-label="Next photo"
            >
              <ChevronIcon direction="right" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-2 rounded-full transition ${
                    index === activeIndex
                      ? "bg-white"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Photo ${index + 1} of ${count}`}
                  aria-current={index === activeIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            {images.map((img, index) => (
              <button
                key={img.id}
                ref={(element) => {
                  thumbRefs.current[index] = element;
                }}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                  index === activeIndex
                    ? "ring-2 ring-[#003262] ring-offset-2 dark:ring-[#FDB515]"
                    : "opacity-75 hover:opacity-100"
                }`}
                aria-label={`View photo ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <SafeListingImage
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}
