import Link from "next/link";
import { legalBackLabel, sanitizeReturnTo } from "@/lib/legal-links";

type Props = {
  from?: string;
};

export function LegalBackLink({ from }: Props) {
  const returnTo = sanitizeReturnTo(from);

  return (
    <Link
      href={returnTo}
      className="mb-8 inline-block text-sm text-[#003262] underline dark:text-[#FDB515]"
    >
      {legalBackLabel(returnTo)}
    </Link>
  );
}
