"use client";

import { useState } from "react";
import { acceptTerms } from "@/app/actions/auth";
import { TermsAgreementCheckbox } from "./TermsAgreementCheckbox";
import { TermsPlaceholderContent } from "./TermsPlaceholderContent";
import { useReturnTo } from "@/hooks/useReturnTo";

type Props = {
  redirectTo?: string;
  error?: string;
};

export function AcceptTermsForm({ redirectTo = "/", error }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState(error ?? "");
  const returnTo = useReturnTo();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed || pending) return;

    setPending(true);
    setLocalError("");

    const formData = new FormData();
    formData.set("agreed", agreed ? "on" : "");
    formData.set("redirect", redirectTo);

    const result = await acceptTerms(formData);
    if (result?.error) {
      setLocalError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TermsPlaceholderContent returnTo={returnTo} />

      <TermsAgreementCheckbox
        id="accept-terms-agreement"
        checked={agreed}
        onChange={setAgreed}
        returnTo={returnTo}
      />

      {localError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {localError}
        </p>
      )}

      <button
        type="submit"
        disabled={!agreed || pending}
        className="w-full rounded-xl bg-[#003262] px-4 py-3 text-sm font-medium text-white hover:bg-[#002244] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Continuing…" : "Continue"}
      </button>
    </form>
  );
}
