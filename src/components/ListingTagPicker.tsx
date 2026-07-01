"use client";

import { useState } from "react";
import {
  LISTING_TAG_SUGGESTIONS,
  MAX_LISTING_TAGS,
  MAX_TAG_LENGTH,
  normalizeListingTags,
} from "@/lib/tags";

type Props = {
  initialTags?: string[];
  onTagsChange?: () => void;
};

export function ListingTagPicker({ initialTags = [], onTagsChange }: Props) {
  const [selected, setSelected] = useState<string[]>(
    normalizeListingTags(initialTags)
  );
  const [customTag, setCustomTag] = useState("");
  const [error, setError] = useState("");

  function isSelected(tag: string) {
    return selected.some((value) => value.toLowerCase() === tag.toLowerCase());
  }

  function toggleTag(tag: string) {
    setError("");
    onTagsChange?.();
    if (isSelected(tag)) {
      setSelected((current) =>
        current.filter((value) => value.toLowerCase() !== tag.toLowerCase())
      );
      return;
    }

    if (selected.length >= MAX_LISTING_TAGS) {
      setError(`You can add up to ${MAX_LISTING_TAGS} tags.`);
      return;
    }

    setSelected((current) => [...current, tag]);
  }

  function addCustomTag() {
    setError("");
    const tag = customTag.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag) return;

    if (isSelected(tag)) {
      setError("That tag is already added.");
      return;
    }

    if (selected.length >= MAX_LISTING_TAGS) {
      setError(`You can add up to ${MAX_LISTING_TAGS} tags.`);
      return;
    }

    setSelected((current) => [...current, tag]);
    setCustomTag("");
    onTagsChange?.();
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Tags</label>
      <p className="mb-3 text-xs text-zinc-500">
        Pick suggestions or add your own (up to {MAX_LISTING_TAGS}).
      </p>

      <div className="flex flex-wrap gap-2">
        {LISTING_TAG_SUGGESTIONS.map((tag) => {
          const active = isSelected(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-[#003262] bg-[#003262] text-white dark:border-[#FDB515] dark:bg-[#FDB515] dark:text-[#003262]"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-[#003262] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustomTag();
            }
          }}
          maxLength={MAX_TAG_LENGTH}
          placeholder="Add your own tag"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="button"
          onClick={addCustomTag}
          className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-zinc-500">Selected</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {selected.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
