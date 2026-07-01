"use client";

import { useState } from "react";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { TermsAgreementCheckbox } from "./TermsAgreementCheckbox";
import { useReturnTo } from "@/hooks/useReturnTo";

type Props = {
  redirectTo?: string;
  urlError?: string;
};

export function SignUpForm({ redirectTo = "/", urlError }: Props) {
  const [agreed, setAgreed] = useState(false);
  const returnTo = useReturnTo();

  return (
    <div className="space-y-4">
      {urlError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {urlError}
        </p>
      )}

      <TermsAgreementCheckbox
        checked={agreed}
        onChange={setAgreed}
        returnTo={returnTo}
      />

      <GoogleAuthButton
        mode="signup"
        redirectTo={redirectTo}
        disabled={!agreed}
        requireTermsCookie
      />
    </div>
  );
}
