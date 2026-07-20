import { TermsOfServiceContent } from "@/components/TermsOfServiceContent";
import { LegalBackLink } from "@/components/LegalBackLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for using Calket, the UC Berkeley student marketplace.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <LegalBackLink from={params.from} />
      <TermsOfServiceContent />
    </div>
  );
}
