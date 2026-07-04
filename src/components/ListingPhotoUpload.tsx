"use client";

import { useEffect, useRef, useState } from "react";

export type ExistingListingPhoto = {
  id: string;
  url: string;
  storage_path: string;
};

type PhotoSlot =
  | {
      key: string;
      kind: "existing";
      id: string;
      url: string;
      storage_path: string;
    }
  | {
      key: string;
      kind: "new";
      file: File;
      url: string;
    };

type Props = {
  existingImages?: ExistingListingPhoto[];
  onFilesChange?: (files: File[]) => void;
  onPhotoCountChange?: (count: number) => void;
};

function buildPhotoOrder(slots: PhotoSlot[]): string {
  let newIndex = 0;
  const order = slots.map((slot) => {
    if (slot.kind === "existing") {
      return `e:${slot.id}`;
    }
    const token = `n:${newIndex}`;
    newIndex++;
    return token;
  });
  return JSON.stringify(order);
}

export function ListingPhotoUpload({
  existingImages = [],
  onFilesChange,
  onPhotoCountChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [slots, setSlots] = useState<PhotoSlot[]>(() =>
    existingImages.map((image) => ({
      key: `existing-${image.id}`,
      kind: "existing",
      id: image.id,
      url: image.url,
      storage_path: image.storage_path,
    }))
  );

  const newFiles = slots
    .filter((slot): slot is Extract<PhotoSlot, { kind: "new" }> => slot.kind === "new")
    .map((slot) => slot.file);

  useEffect(() => {
    const files = slots
      .filter(
        (slot): slot is Extract<PhotoSlot, { kind: "new" }> => slot.kind === "new"
      )
      .map((slot) => slot.file);
    onFilesChange?.(files);
    onPhotoCountChange?.(slots.length);
  }, [slots, onFilesChange, onPhotoCountChange]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    for (const file of newFiles) {
      dataTransfer.items.add(file);
    }
    input.files = dataTransfer.files;
  }, [newFiles]);

  useEffect(() => {
    return () => {
      const urls = previewUrlsRef.current;
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    setSlots((current) => [
      ...current,
      ...selected.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url);
        return {
          key: `new-${file.name}-${file.lastModified}-${file.size}-${Math.random()}`,
          kind: "new" as const,
          file,
          url,
        };
      }),
    ]);

    e.target.value = "";
  }

  function removePhoto(key: string) {
    setSlots((current) => {
      const target = current.find((slot) => slot.key === key);
      if (!target) return current;

      if (target.kind === "new") {
        URL.revokeObjectURL(target.url);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== target.url
        );
      }

      return current.filter((slot) => slot.key !== key);
    });
  }

  function movePhoto(key: string, direction: -1 | 1) {
    setSlots((current) => {
      const index = current.findIndex((slot) => slot.key === key);
      if (index < 0) return current;

      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  const photoOrder = buildPhotoOrder(slots);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Photos</label>
      <input type="hidden" name="photo_order" value={photoOrder} />
      <div className="flex flex-wrap items-start gap-3">
        {slots.map((slot, index) => (
          <div
            key={slot.key}
            className="group relative aspect-square h-24 w-24 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.url}
              alt={slot.kind === "new" ? slot.file.name : "Listing photo"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-black/60 p-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => movePhoto(slot.key, -1)}
                disabled={index === 0}
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Move photo left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => movePhoto(slot.key, 1)}
                disabled={index === slots.length - 1}
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Move photo right"
              >
                ›
              </button>
            </div>
            <button
              type="button"
              onClick={() => removePhoto(slot.key)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-0 transition hover:bg-black focus:opacity-100 group-hover:opacity-100"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition hover:border-[#003262] hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-[#FDB515]"
          aria-label="Add photos"
        >
          <PhotoIcon />
          <span className="text-xs">Add photos</span>
        </button>
      </div>
      <input
        ref={inputRef}
        name="images"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <p className="mt-2 text-xs text-zinc-500">
        {slots.length > 0
          ? `${slots.length} photo${slots.length === 1 ? "" : "s"} — use arrows to reorder`
          : "Tap the icon to upload photos"}
      </p>
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
      />
    </svg>
  );
}
