import { TermsOfServiceContent } from "@/components/TermsOfServiceContent";
import { LegalBackLink } from "@/components/LegalBackLink";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
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
