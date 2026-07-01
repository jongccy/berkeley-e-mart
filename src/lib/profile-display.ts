import type { Profile } from "@/types/database";

export type ProfilePublicIdentity = Pick<
  Profile,
  "display_name" | "show_real_name" | "marketplace_alias"
>;

export const PROFILE_IDENTITY_SELECT =
  "id, display_name, show_real_name, marketplace_alias";

export function resolvePublicName(
  profile: ProfilePublicIdentity | null
): string {
  if (!profile) return "Berkeley Student";

  if (!profile.show_real_name) {
    return profile.marketplace_alias?.trim() || "Berkeley Student";
  }

  return profile.display_name?.trim() || "Berkeley Student";
}

export function resolveSellerDisplayName(
  profile: ProfilePublicIdentity | null
): string {
  return resolvePublicName(profile);
}

export function sellerProfileIsPublic(
  profile: ProfilePublicIdentity | null
): boolean {
  return profile?.show_real_name !== false;
}
