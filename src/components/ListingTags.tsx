import Link from "next/link";

type Props = {
  tags: string[];
  size?: "sm" | "md";
  /** When true (default), chips link to browse filtered by that tag. */
  linkable?: boolean;
};

export function ListingTags({ tags, size = "md", linkable = true }: Props) {
  if (!tags.length) return null;

  const chipClass =
    size === "sm"
      ? "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 transition hover:bg-[#003262]/10 hover:text-[#003262] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#FDB515]/15 dark:hover:text-[#FDB515]"
      : "rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 transition hover:bg-[#003262]/10 hover:text-[#003262] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-[#FDB515]/15 dark:hover:text-[#FDB515]";

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) =>
        linkable ? (
          <Link
            key={tag}
            href={`/browse?tag=${encodeURIComponent(tag)}`}
            className={chipClass}
          >
            {tag}
          </Link>
        ) : (
          <span key={tag} className={chipClass}>
            {tag}
          </span>
        )
      )}
    </div>
  );
}
