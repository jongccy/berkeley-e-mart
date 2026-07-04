type Props = {
  className?: string;
};

export function VerifiedBadge({ className = "" }: Props) {
  return (
    <svg
      className={`inline-block h-4 w-4 shrink-0 text-[#003262] dark:text-[#60a5fa] ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      role="img"
      aria-label="Verified Berkeley student"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
