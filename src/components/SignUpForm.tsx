"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "@/app/actions/auth";
import { GoogleAuthButton } from "./GoogleAuthButton";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <div className="space-y-4">
      <GoogleAuthButton mode="signup" />

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

      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {state.success}{" "}
          <Link href="/login" className="font-medium underline">
            Log in
          </Link>
        </p>
      )}

      <form action={formAction} className="space-y-4">
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
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244] disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
