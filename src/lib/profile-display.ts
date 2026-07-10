import type { Profile } from "@/types/database";

export type ProfilePublicIdentity = Pick<
  Profile,
  "display_name" | "show_real_name" | "marketplace_alias" | "is_verified_berkeley"
>;

export const PROFILE_IDENTITY_SELECT =
  "id, display_name, show_real_name, marketplace_alias, is_verified_berkeley";

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

export function resolveProfileHandle(
  profile: ProfilePublicIdentity | null
): string {
  const name = resolvePublicName(profile);
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return handle || "student";
}

export function profileIsVerified(
  profile: Pick<Profile, "is_verified_berkeley"> | null | undefined
): boolean {
  return Boolean(profile?.is_verified_berkeley);
}
