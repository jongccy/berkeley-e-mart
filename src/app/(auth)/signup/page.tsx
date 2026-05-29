import Link from "next/link";
import { SignUpForm } from "@/components/SignUpForm";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Sign up</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Berkeley students only — use your @berkeley.edu email or Berkeley Google
        account.
      </p>
      {params.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(params.error)}
        </p>
      )}
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#003262] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
