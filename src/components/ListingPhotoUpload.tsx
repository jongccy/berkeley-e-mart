"use client";

import { useEffect, useRef, useState } from "react";

type Preview = {
  id: string;
  file: File;
  name: string;
  url: string;
};

type Props = {
  onFilesChange?: (files: File[]) => void;
};

export function ListingPhotoUpload({ onFilesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    for (const file of files) {
      dataTransfer.items.add(file);
    }
    input.files = dataTransfer.files;
  }, [files]);

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

    setFiles((current) => [...current, ...selected]);
    setPreviews((current) => {
      const added = selected.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url);
        return {
          id: `${file.name}-${file.lastModified}-${file.size}-${Math.random()}`,
          file,
          name: file.name,
          url,
        };
      });
      return [...current, ...added];
    });

    e.target.value = "";
  }

  function removePhoto(id: string) {
    setPreviews((current) => {
      const target = current.find((preview) => preview.id === id);
      if (!target) return current;

      URL.revokeObjectURL(target.url);
      previewUrlsRef.current = previewUrlsRef.current.filter(
        (url) => url !== target.url
      );
      setFiles((currentFiles) =>
        currentFiles.filter((file) => file !== target.file)
      );
      return current.filter((preview) => preview.id !== id);
    });
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Photos</label>
      <div className="flex flex-wrap items-start gap-3">
        {previews.map((preview) => (
          <div
            key={preview.id}
            className="group relative aspect-square h-24 w-24 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt={preview.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(preview.id)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-0 transition hover:bg-black focus:opacity-100 group-hover:opacity-100"
              aria-label={`Remove ${preview.name}`}
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
        {previews.length > 0
          ? `${previews.length} photo${previews.length === 1 ? "" : "s"} selected — tap again to add more`
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
