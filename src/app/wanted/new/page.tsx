import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WantedForm } from "@/components/WantedForm";
import { createWantedPost } from "@/app/actions/wanted";
import { createClient } from "@/lib/supabase/server";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post a request",
  robots: { index: false, follow: false },
};

export default async function NewWantedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/wanted/new");

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Verify your Berkeley email before posting requests.
        </p>
        <Link href="/profile/me" className="mt-4 inline-block text-[#003262] underline">
          Go to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold">Post a request</h1>
      <WantedForm action={createWantedPost} />
    </div>
  );
}
