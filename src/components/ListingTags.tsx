type Props = {
  tags: string[];
  size?: "sm" | "md";
};

export function ListingTags({ tags, size = "md" }: Props) {
  if (!tags.length) return null;

  const chipClass =
    size === "sm"
      ? "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      : "rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className={chipClass}>
          {tag}
        </span>
      ))}
    </div>
  );
}
