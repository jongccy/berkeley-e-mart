import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { LegalBackLink } from "@/components/LegalBackLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Calket, the UC Berkeley student marketplace.",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <LegalBackLink from={params.from} />
      <PrivacyPolicyContent />
    </div>
  );
}
