import { JsonLd } from "@/components/JsonLd";
import { CANONICAL_SITE_URL } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { formatCategory } from "@/lib/format";

type Props = {
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    price_cents: number | null;
    status: string;
  };
  imageUrl?: string | null;
};

export function ListingStructuredData({ listing, imageUrl }: Props) {
  const url = `${CANONICAL_SITE_URL}/listings/${listing.id}`;
  const price =
    listing.price_cents != null && listing.price_cents >= 0
      ? (listing.price_cents / 100).toFixed(2)
      : undefined;
  const availability =
    listing.status === "sold"
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description:
      listing.description?.trim() ||
      `${listing.title} for sale on ${SITE_NAME}, the UC Berkeley student marketplace.`,
    category: formatCategory(listing.category),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      ...(price !== undefined ? { price } : {}),
      availability,
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  if (imageUrl) {
    data.image = [imageUrl];
  }

  return <JsonLd data={data} />;
}
