export const BERKELEY_EMAIL_SUFFIX = "@berkeley.edu";

export const LISTING_TYPES = [
  { value: "item", label: "Item" },
  { value: "service", label: "Service" },
  { value: "lease", label: "Housing lease" },
] as const;

export const CATEGORIES = [
  "general",
  "electronics",
  "furniture",
  "books",
  "clothing",
  "tutoring",
  "moving",
  "cleaning",
  "housing",
  "other",
] as const;

export const LISTING_IMAGE_BUCKET = "listing-images";

export const AVATAR_BUCKET = "avatars";
