import { CATEGORIES } from "@/lib/constants";

export function formatPrice(cents: number | null): string {
  if (cents === null) return "Contact for price";
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatCategory(value: string): string {
  const match = CATEGORIES.find((c) => c.value === value);
  return match?.label ?? value;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getPublicImageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
