export const BERKELEY_EMAIL_SUFFIX = "@berkeley.edu";

export const SITE_NAME = "Calket";
export const SITE_LOGO_PATH = "/calket-logo-v2.png";

export const HOUSING_CATEGORY = "housing";

export const FREE_CATEGORY = "free";

export const OTHER_CATEGORY = "other";

export const DEFAULT_CATEGORY_LABEL = "Others";

export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "textbooks", label: "Textbooks" },
  { value: "housing", label: "Housing" },
  { value: "transportation", label: "Transportation" },
  { value: "appliances", label: "Home Appliances" },
  { value: "clothing", label: "Clothing" },
  { value: "tickets", label: "Tickets / Events" },
  { value: "free", label: "Free / Giveaway" },
  { value: OTHER_CATEGORY, label: DEFAULT_CATEGORY_LABEL },
] as const;

export const LISTING_IMAGE_BUCKET = "listing-images";

export const AVATAR_BUCKET = "avatars";

export const DEFAULT_AVATAR_URL = "/default-avatar.svg";
