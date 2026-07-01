import Link from "next/link";
import { SignUpForm } from "@/components/SignUpForm";
import { AuthCard } from "@/components/AuthCard";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Welcome to Calket"
      subtitle="Create your account with Berkeley Google"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#003262] underline dark:text-[#FDB515]">
            Log in
          </Link>
        </>
      }
    >
      <SignUpForm
        redirectTo={params.redirect ?? "/"}
        urlError={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </AuthCard>
  );
}
