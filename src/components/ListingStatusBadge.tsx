import type { ListingStatus } from "@/types/database";

type Props = {
  status: ListingStatus;
};

export function ListingStatusBadge({ status }: Props) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-green-500"
          aria-hidden
        />
        Available
      </span>
    );
  }

  if (status === "sold") {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-red-500"
          aria-hidden
        />
        Sold
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500">
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-zinc-400"
        aria-hidden
      />
      Removed
    </span>
  );
}
