import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { LegalBackLink } from "@/components/LegalBackLink";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
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
