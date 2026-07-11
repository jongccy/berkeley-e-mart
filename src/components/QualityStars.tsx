type Props = {
  value: number;
  onChange: (value: number) => void;
  name?: string;
};

export function QualityStars({ value, onChange, name = "quality_rating" }: Props) {
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Item condition">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-2xl leading-none transition hover:scale-110"
            aria-label={`${star} star${star === 1 ? "" : "s"} for condition`}
            aria-pressed={star <= value}
          >
            <span className={star <= value ? "text-[#FDB515]" : "text-zinc-300"}>
              ★
            </span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {value === 0
          ? "Rate the item's condition from 1 (poor) to 5 (like new)"
          : `${value} of 5 — condition of the item`}
      </p>
    </div>
  );
}
