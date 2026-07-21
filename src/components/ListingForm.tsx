"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
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
import { validateExactHousingLocation } from "@/lib/housing-listing";
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
      : (listing?.category ?? "");
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
  const photoFilesRef = useRef<File[]>([]);
  const [photoCount, setPhotoCount] = useState(
    listing ? existingPhotos.length : 0
  );
  const [photoError, setPhotoError] = useState("");
  const [housingLocationError, setHousingLocationError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const isHousing = category === HOUSING_CATEGORY;
  const isFreeListing = category === FREE_CATEGORY;
  const isNewListing = !listing;

  function handlePhotosChange(files: File[]) {
    photoFilesRef.current = files;
  }

  function handlePriceChange(value: string) {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    const normalized =
      parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`
        : sanitized;
    setPrice(normalized);

    const parsed = parseFloat(normalized);
    if (Number.isFinite(parsed) && parsed === 0 && !isHousing) {
      setCategory(FREE_CATEGORY);
    } else if (category === FREE_CATEGORY && parsed > 0) {
      setCategory(OTHER_CATEGORY);
    }

    setIsDirty(true);
  }

  function validateBeforeSubmit(form: HTMLFormElement): boolean {
    setQualityError("");
    setPhotoError("");
    setHousingLocationError("");

    if (isHousing) {
      const location = String(
        new FormData(form).get("address_area") ?? ""
      ).trim();
      const locationError = validateExactHousingLocation(location);
      if (locationError) {
        setHousingLocationError(locationError);
        return false;
      }
    }

    if (qualityRating < 1 || qualityRating > 5) {
      setQualityError("Select a condition rating from 1 to 5 stars.");
      return false;
    }

    const files = photoFilesRef.current;
    if (isNewListing && files.length === 0) {
      setPhotoError("Add at least one photo.");
      return false;
    }

    if (isEdit && photoCount === 0) {
      setPhotoError("Keep at least one photo.");
      return false;
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > 45 * 1024 * 1024) {
      setPhotoError(
        "Photos are too large combined (max ~45MB). Try fewer or smaller photos."
      );
      return false;
    }

    return true;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Only block invalid submits; let the form `action` invoke the Server Action.
    if (!validateBeforeSubmit(event.currentTarget)) {
      event.preventDefault();
    }
  }

  function submitAction(formData: FormData) {
    // File inputs can be empty after pick; inject prepared files from state.
    formData.delete("images");
    for (const file of photoFilesRef.current) {
      formData.append("images", file);
    }

    if (isEdit) {
      editAction(formData);
    } else {
      createAction(formData);
    }
  }

  const formError = formState.error;

  return (
    <form
      action={submitAction}
      className="mx-auto max-w-xl space-y-4"
      onSubmit={handleSubmit}
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
        <label className="mb-1 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          name="description"
          rows={5}
          defaultValue={listing?.description ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className={isHousing ? "" : "grid gap-4 sm:grid-cols-2"}>
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
            <option value="" disabled>
              Choose Category
            </option>
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
        {!isHousing && (
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
        )}
      </div>

      {isHousing && (
        <fieldset className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium">
            Housing / leasing details
          </legend>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Exact location
            </label>
            <input
              name="address_area"
              required
              defaultValue={listing?.address_area ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Full street address required — not a neighborhood or general area.
            </p>
            {housingLocationError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {housingLocationError}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium"># of beds</label>
              <input
                name="bedrooms"
                type="number"
                min="0"
                required
                defaultValue={listing?.bedrooms ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                # of bathrooms
              </label>
              <input
                name="bathrooms"
                type="number"
                min="0"
                step="0.5"
                required
                defaultValue={listing?.bathrooms ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Sqft <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              name="sqft"
              type="number"
              min="1"
              defaultValue={listing?.sqft ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Included utilities{" "}
              <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              name="included_utilities"
              defaultValue={listing?.included_utilities ?? ""}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Price ($/month)
            </label>
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
                className="w-full rounded-lg border border-zinc-300 py-2 pl-7 pr-3 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Leasing</label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <span className="mb-1 block text-xs text-zinc-500">From</span>
                <input
                  name="lease_start"
                  type="date"
                  required
                  defaultValue={listing?.lease_start ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <span className="hidden text-sm text-zinc-500 sm:block">→</span>
              <div>
                <span className="mb-1 block text-xs text-zinc-500">To</span>
                <input
                  name="lease_end"
                  type="date"
                  required
                  defaultValue={listing?.lease_end ?? ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Condition</label>
        <p className="mb-2 text-xs text-zinc-500">
          How would you rate this item&apos;s physical condition?
        </p>
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

      <div>
        <ListingPhotoUpload
          existingImages={isEdit ? existingPhotos : undefined}
          onFilesChange={handlePhotosChange}
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
          className="w-full rounded-full bg-[#003262] py-2.5 font-semibold text-white transition hover:bg-[#002244] disabled:opacity-60"
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
