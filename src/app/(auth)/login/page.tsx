import Link from "next/link";
import { SignInForm } from "@/components/SignInForm";
import { AuthCard } from "@/components/AuthCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string;
    error?: string;
    redirect?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in with your Berkeley Google account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#003262] underline dark:text-[#FDB515]">
            Sign up
          </Link>
        </>
      }
    >
      <SignInForm
        redirectTo={params.redirect ?? "/"}
        message={params.message}
        urlError={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </AuthCard>
  );
}
