import { CATEGORIES, LISTING_TYPES } from "@/lib/constants";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function WantedForm({ action }: Props) {
  return (
    <form action={action} className="mx-auto max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Looking for</label>
        <select
          name="type"
          defaultValue="item"
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
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          required
          rows={5}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            name="category"
            defaultValue="general"
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
          <label className="mb-1 block text-sm font-medium">Max budget (USD)</label>
          <input
            name="max_price"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244]"
      >
        Post request
      </button>
    </form>
  );
}
