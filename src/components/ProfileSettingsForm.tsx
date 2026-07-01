"use client";

import { useActionState, useState } from "react";
import {
  updateProfile,
  type ProfileFormState,
} from "@/app/actions/profile";
import { ProfileIdentityPicker } from "@/components/ProfileIdentityPicker";
import type { Profile } from "@/types/database";

const BIO_HELPER =
  "Adding a bio increases your credibility! Share a little bit about you! Share just a general location of where you want to trade! (ex. Sather Gate, Downtown Bart Station)";

type Props = {
  profile: Profile | null;
  userEmail: string;
};

export function ProfileSettingsForm({ profile, userEmail }: Props) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {}
  );
  const [identityMode, setIdentityMode] = useState<"real_name" | "alias">(
    profile?.show_real_name !== false ? "real_name" : "alias"
  );
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [marketplaceAlias, setMarketplaceAlias] = useState(
    profile?.marketplace_alias ?? ""
  );
  const [bio, setBio] = useState(profile?.bio ?? "");

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      <ProfileIdentityPicker
        identityMode={identityMode}
        onIdentityModeChange={setIdentityMode}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        marketplaceAlias={marketplaceAlias}
        onMarketplaceAliasChange={setMarketplaceAlias}
      />

      <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Linked Berkeley Email</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {userEmail}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Only visible to you. Other students never see your email.
        </p>
      </section>

      <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Bio</h2>
        <textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={BIO_HELPER}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#003262] py-2.5 font-medium text-white hover:bg-[#002244] disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
