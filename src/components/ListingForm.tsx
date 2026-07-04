"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  CATEGORIES,
  FREE_CATEGORY,
  HOUSING_CATEGORY,
  OTHER_CATEGORY,
} from "@/lib/constants";
import {
  createListingFromForm,
  updateListingFromForm,
  type ListingFormState,
} from "@/app/actions/listings";
import { ListingPhotoUpload, type ExistingListingPhoto } from "@/components/ListingPhotoUpload";
import { ListingTagPicker } from "@/components/ListingTagPicker";
import { QualityStars } from "@/components/QualityStars";
import type { Listing } from "@/types/database";

type Props = {
  listing?: Listing;
  existingPhotos?: ExistingListingPhoto[];
  initialError?: string;
};

export function ListingForm({ listing, existingPhotos = [], initialError }: Props) {
  const isEdit = !!listing;
  const [createState, createAction, createPending] = useActionState<
    ListingFormState,
    FormData
  >(createListingFromForm, initialError ? { error: initialError } : {});
  const [editState, editAction, editPending] = useActionState<
    ListingFormState,
    FormData
  >(updateListingFromForm, {});
  const router = useRouter();
  const formState = isEdit ? editState : createState;
  const isPending = isEdit ? editPending : createPending;

  useEffect(() => {
    if (formState.redirectTo) {
      router.push(formState.redirectTo);
    }
  }, [formState.redirectTo, router]);

  const defaultCategory =
    listing?.price_cents === 0
      ? FREE_CATEGORY
      : (listing?.category ?? OTHER_CATEGORY);
  const [category, setCategory] = useState(defaultCategory);
  const [qualityRating, setQualityRating] = useState(
    listing?.quality_rating && listing.quality_rating >= 1
      ? listing.quality_rating
      : 0
  );
  const [qualityError, setQualityError] = useState("");
  const [price, setPrice] = useState(
    listing?.price_cents != null ? (listing.price_cents / 100).toString() : ""
  );
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoCount, setPhotoCount] = useState(
    listing ? existingPhotos.length : 0
  );
  const [photoError, setPhotoError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const isHousing = category === HOUSING_CATEGORY;
  const isFreeListing = category === FREE_CATEGORY;
  const isNewListing = !listing;

  function handlePriceChange(value: string) {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    const normalized =
      parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`
        : sanitized;
    setPrice(normalized);

    const parsed = parseFloat(normalized);
    if (Number.isFinite(parsed) && parsed === 0) {
      setCategory(FREE_CATEGORY);
    } else if (category === FREE_CATEGORY && parsed > 0) {
      setCategory(OTHER_CATEGORY);
    }

    setIsDirty(true);
  }

  function validateBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    setQualityError("");
    setPhotoError("");

    if (qualityRating < 1 || qualityRating > 5) {
      event.preventDefault();
      setQualityError("Select a quality rating from 1 to 5 stars.");
      return;
    }

    if (isNewListing && photoFiles.length === 0) {
      event.preventDefault();
      setPhotoError("Add at least one photo.");
      return;
    }

    if (isEdit && photoCount === 0) {
      event.preventDefault();
      setPhotoError("Keep at least one photo.");
    }
  }

  const formError = formState.error;

  return (
    <form
      action={isEdit ? editAction : createAction}
      className="mx-auto max-w-xl space-y-4"
      onSubmit={validateBeforeSubmit}
      onChange={() => setIsDirty(true)}
    >
      {isEdit && <input type="hidden" name="listing_id" value={listing.id} />}

      {formError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {formError}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          defaultValue={listing?.title ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={listing?.description ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            name="category"
            required
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setIsDirty(true);
            }}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            {listing?.category &&
              !CATEGORIES.some((c) => c.value === listing.category) && (
                <option value={listing.category}>{listing.category}</option>
              )}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              $
            </span>
            <input
              name="price"
              type="text"
              inputMode="decimal"
              required
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-300 py-2 pl-7 pr-3 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          {isFreeListing && (
            <p className="mt-1 text-xs text-zinc-500">
              $0 listings are categorized as Free / Giveaway.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Quality</label>
        <QualityStars
          value={qualityRating}
          onChange={(value) => {
            setQualityRating(value);
            setIsDirty(true);
          }}
        />
        {qualityError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {qualityError}
          </p>
        )}
      </div>

      <ListingTagPicker
        initialTags={listing?.tags ?? []}
        onTagsChange={() => setIsDirty(true)}
      />

      {isHousing && (
        <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium">
            Housing / leasing details
          </legend>
          <input
            name="address_area"
            required
            placeholder="Neighborhood / area only"
            defaultValue={listing?.address_area ?? ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="bedrooms"
              type="number"
              min="0"
              required
              placeholder="Bedrooms"
              defaultValue={listing?.bedrooms ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="bathrooms"
              type="number"
              min="0"
              step="0.5"
              required
              placeholder="Bathrooms"
              defaultValue={listing?.bathrooms ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="lease_start"
              type="date"
              required
              defaultValue={listing?.lease_start ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="lease_end"
              type="date"
              required
              defaultValue={listing?.lease_end ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </fieldset>
      )}

      <div>
        <ListingPhotoUpload
          existingImages={isEdit ? existingPhotos : undefined}
          onFilesChange={setPhotoFiles}
          onPhotoCountChange={setPhotoCount}
        />
        {photoError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {photoError}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244] disabled:opacity-60"
        >
          {isPending
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : listing
              ? "Save changes"
              : "Create listing"}
        </button>

        {isEdit && (
          <Link
            href={`/listings/${listing.id}`}
            onClick={(event) => {
              if (
                isDirty &&
                !window.confirm("Discard unsaved changes?")
              ) {
                event.preventDefault();
              }
            }}
            className="block w-full rounded-lg border border-zinc-300 py-2.5 text-center font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Return to Listings
          </Link>
        )}
      </div>
    </form>
  );
}
