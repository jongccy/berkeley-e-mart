/** Matches the 1 (poor) to 5 (like new) scale used by QualityStars. */
const CONDITION_LABELS = ["Poor", "Fair", "Good", "Very good", "Like new"];

type Props = {
  rating: number;
  size?: "sm" | "md";
  showLabel?: boolean;
};

export function StarRating({ rating, size = "md", showLabel = true }: Props) {
  const textSize = size === "sm" ? "text-sm" : "text-base";
  const conditionLabel = CONDITION_LABELS[rating - 1];

  return (
    <div
      className={`flex items-center gap-0.5 ${textSize}`}
      aria-label={`Condition: ${rating} out of 5 stars`}
    >
      {showLabel && (
        <span className="mr-1 text-zinc-500">Condition</span>
      )}
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-[#FDB515]" : "text-zinc-300"}
        >
          ★
        </span>
      ))}
      {conditionLabel && (
        <span className="ml-1.5 font-medium text-zinc-600 dark:text-zinc-400">
          {conditionLabel}
        </span>
      )}
    </div>
  );
}
