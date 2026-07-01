"use client";

import Link from "next/link";
import { legalPageHref } from "@/lib/legal-links";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  returnTo?: string;
};

function stopLabelToggle(e: React.MouseEvent) {
  e.stopPropagation();
}

export function TermsAgreementCheckbox({
  checked,
  onChange,
  id = "terms-agreement",
  returnTo = "/signup",
}: Props) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-left text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#003262] focus:ring-[#003262] dark:border-zinc-600"
      />
      <span>
        I agree to the{" "}
        <Link
          href={legalPageHref("/terms", returnTo)}
          onClick={stopLabelToggle}
          onMouseDown={stopLabelToggle}
          className="font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={legalPageHref("/privacy", returnTo)}
          onClick={stopLabelToggle}
          onMouseDown={stopLabelToggle}
          className="font-medium text-[#003262] underline dark:text-[#FDB515]"
        >
          Privacy Policy
        </Link>
        . I understand that fraudulent listings, scams, or misuse of this
        platform will result in a permanent ban.
      </span>
    </label>
  );
}
