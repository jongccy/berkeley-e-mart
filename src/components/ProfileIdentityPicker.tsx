"use client";

type Props = {
  identityMode: "real_name" | "alias";
  onIdentityModeChange: (mode: "real_name" | "alias") => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  marketplaceAlias: string;
  onMarketplaceAliasChange: (value: string) => void;
};

const IDENTITY_DESCRIPTIONS = {
  real_name:
    "Buyers see your name on listings and messages. Your public profile is linked so they can view your other items.",
  alias:
    "Buyers see only your marketplace ID, not your display name. Your profile stays private on listings for more anonymity.",
} as const;

export function ProfileIdentityPicker({
  identityMode,
  onIdentityModeChange,
  displayName,
  onDisplayNameChange,
  marketplaceAlias,
  onMarketplaceAliasChange,
}: Props) {
  return (
    <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold">ID</h2>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="radio"
              name="identity_mode"
              value="real_name"
              checked={identityMode === "real_name"}
              onChange={() => onIdentityModeChange("real_name")}
              className="h-4 w-4 accent-[#003262]"
            />
            Name:
          </label>
          <input
            name="display_name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Your display name"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {identityMode === "real_name" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {IDENTITY_DESCRIPTIONS.real_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="radio"
              name="identity_mode"
              value="alias"
              checked={identityMode === "alias"}
              onChange={() => onIdentityModeChange("alias")}
              className="h-4 w-4 accent-[#003262]"
            />
            Marketplace ID:
          </label>
          <input
            name="marketplace_alias"
            value={marketplaceAlias}
            onChange={(e) => onMarketplaceAliasChange(e.target.value)}
            placeholder="e.g. CalBear2026"
            maxLength={40}
            minLength={3}
            pattern="[a-zA-Z0-9._\-]+"
            title="Letters, numbers, periods, underscores, and hyphens only"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {identityMode === "alias" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {IDENTITY_DESCRIPTIONS.alias} IDs must be unique.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
