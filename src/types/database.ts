export type ListingStatus = "active" | "sold" | "removed";
export type SellerDisplayMode = "profile" | "nickname";

export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  show_real_name: boolean;
  marketplace_alias: string | null;
  created_at: string;
  updated_at: string;
  terms_accepted_at: string | null;
  is_verified_berkeley: boolean;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_cents: number | null;
  category: string;
  status: ListingStatus;
  sold_at: string | null;
  address_area: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lease_start: string | null;
  lease_end: string | null;
  seller_display_mode: SellerDisplayMode;
  seller_display_name: string | null;
  quality_rating: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};

export type ListingWithImages = Listing & {
  listing_images: ListingImage[];
  profiles: Pick<
    Profile,
    | "id"
    | "display_name"
    | "show_real_name"
    | "marketplace_alias"
    | "avatar_url"
    | "is_verified_berkeley"
  > | null;
};

export type Conversation = {
  id: string;
  listing_id: string | null;
  wanted_post_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type WantedPost = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  max_price_cents: number | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  profiles?: Pick<
    Profile,
    | "id"
    | "display_name"
    | "show_real_name"
    | "marketplace_alias"
    | "avatar_url"
    | "is_verified_berkeley"
  > | null;
};

export type ListingView = {
  id: string;
  user_id: string;
  listing_id: string;
  viewed_at: string;
};

export type ListingLike = {
  user_id: string;
  listing_id: string;
  created_at: string;
};
