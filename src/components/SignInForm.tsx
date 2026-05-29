"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthFormState } from "@/app/actions/auth";
import { GoogleAuthButton } from "./GoogleAuthButton";

const initialState: AuthFormState = {};

type Props = {
  redirectTo?: string;
  message?: string;
  urlError?: string;
};

export function SignInForm({ redirectTo = "/", message, urlError }: Props) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const error = state.error ?? urlError;

  return (
    <div className="space-y-4">
      <GoogleAuthButton redirectTo={redirectTo} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950">
            or email
          </span>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="mb-1 block text-sm font-medium">Berkeley email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@berkeley.edu"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244] disabled:opacity-50"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="text-[#003262] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
