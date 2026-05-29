import { CATEGORIES, LISTING_TYPES } from "@/lib/constants";
import type { Listing } from "@/types/database";

type Props = {
  listing?: Listing;
  action: (formData: FormData) => Promise<void>;
};

export function ListingForm({ listing, action }: Props) {
  const defaultType = listing?.type ?? "item";

  return (
    <form action={action} className="mx-auto max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          name="type"
          defaultValue={defaultType}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

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
            defaultValue={listing?.category ?? "general"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Price (USD, optional)
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              listing?.price_cents != null
                ? (listing.price_cents / 100).toString()
                : ""
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-medium">Lease details (if housing)</legend>
        <input
          name="address_area"
          placeholder="Neighborhood / area only"
          defaultValue={listing?.address_area ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="bedrooms"
            type="number"
            min="0"
            placeholder="Bedrooms"
            defaultValue={listing?.bedrooms ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            name="bathrooms"
            type="number"
            min="0"
            step="0.5"
            placeholder="Bathrooms"
            defaultValue={listing?.bathrooms ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="lease_start"
            type="date"
            defaultValue={listing?.lease_start ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            name="lease_end"
            type="date"
            defaultValue={listing?.lease_end ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </fieldset>

      {!listing && (
        <div>
          <label className="mb-1 block text-sm font-medium">Photos</label>
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="w-full text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244]"
      >
        {listing ? "Save changes" : "Create listing"}
      </button>
    </form>
  );
}
