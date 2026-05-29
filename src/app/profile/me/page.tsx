import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/me");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const verified = isVerifiedBerkeleyUser(user);

  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
        {!verified && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Email not verified. Check your inbox for the verification link.
          </p>
        )}
      </div>

      <form action={uploadAvatar} className="space-y-2">
        <label className="block text-sm font-medium">Avatar</label>
        <input name="avatar" type="file" accept="image/*" className="text-sm" />
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          Upload avatar
        </button>
      </form>

      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={profile?.bio ?? ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[#003262] py-2.5 text-white hover:bg-[#002244]"
        >
          Save profile
        </button>
      </form>

      <p className="text-center text-sm">
        <Link href={`/profile/${user.id}`} className="text-[#003262] underline">
          View public profile
        </Link>
        {" · "}
        <Link href="/inbox" className="text-[#003262] underline">
          Your messages
        </Link>
      </p>
    </div>
  );
}
