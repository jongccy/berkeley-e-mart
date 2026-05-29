import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { updateListing } from "@/app/actions/listings";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import type { Listing } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/listings/${id}/edit`);
  if (!isVerifiedBerkeleyUser(user)) redirect("/profile/me");

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (!listing) notFound();

  const boundUpdate = updateListing.bind(null, id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit listing</h1>
      <ListingForm listing={listing as Listing} action={boundUpdate} />
    </div>
  );
}
