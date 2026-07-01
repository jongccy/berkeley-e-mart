import Link from "next/link";
import { legalPageHref } from "@/lib/legal-links";

type Props = {
  returnTo?: string;
};

export function TermsPlaceholderContent({ returnTo = "/signup" }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      <p>
        Please review our Terms of Service and Privacy Policy before continuing.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href={legalPageHref("/terms", returnTo)}
          className="font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          Terms of Service
        </Link>
        <Link
          href={legalPageHref("/privacy", returnTo)}
          className="font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
