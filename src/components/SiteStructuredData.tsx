import { JsonLd } from "@/components/JsonLd";
import { CANONICAL_SITE_URL } from "@/lib/auth";
import { SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";

export function SiteStructuredData() {
  const logoUrl = `${CANONICAL_SITE_URL}${SITE_LOGO_PATH}`;

  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: CANONICAL_SITE_URL,
          description:
            "Calket is a marketplace for UC Berkeley students to buy and sell items, services, and housing leases.",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${CANONICAL_SITE_URL}/browse?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: CANONICAL_SITE_URL,
          logo: logoUrl,
          description:
            "Buy and sell with verified Berkeley affiliates on Calket.",
        },
      ]}
    />
  );
}
