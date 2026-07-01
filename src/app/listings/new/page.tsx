import Link from "next/link";
import { ListingForm } from "@/components/ListingForm";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/listings/new");

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Check your Berkeley inbox for the verification link before creating a
          listing.
        </p>
        <Link href="/profile/me" className="mt-4 inline-block text-[#003262] underline">
          Go to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Create listing</h1>
      <ListingForm />
    </div>
  );
}
