import { VerifiedBadge } from "@/components/VerifiedBadge";

type Props = {
  name: string;
  verified?: boolean;
  className?: string;
  nameClassName?: string;
};

export function DisplayNameWithBadge({
  name,
  verified = false,
  className = "",
  nameClassName = "",
}: Props) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 ${className}`}>
      <span className={`truncate ${nameClassName}`}>{name}</span>
      {verified && <VerifiedBadge />}
    </span>
  );
}
