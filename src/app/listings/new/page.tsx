import Link from "next/link";
import type { Metadata } from "next";
import { ListingForm } from "@/components/ListingForm";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create listing",
  robots: { index: false, follow: false },
};

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/listings/new");

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-bold">Berkeley account required</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in with your @berkeley.edu email to create listings.
        </p>
        <Link href="/profile/me" className="mt-4 inline-block text-[#003262] underline">
          Go to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold">Create listing</h1>
      <ListingForm initialError={params.error} />
    </div>
  );
}
