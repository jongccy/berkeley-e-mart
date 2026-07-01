"use client";

import { GoogleAuthButton } from "./GoogleAuthButton";

type Props = {
  redirectTo?: string;
  message?: string;
  urlError?: string;
};

export function SignInForm({ redirectTo = "/", message, urlError }: Props) {
  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {message}
        </p>
      )}
      {urlError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {urlError}
        </p>
      )}

      <GoogleAuthButton redirectTo={redirectTo} />
    </div>
  );
}
