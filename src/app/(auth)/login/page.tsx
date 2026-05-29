import { SignInForm } from "@/components/SignInForm";

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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Log in</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Use your Berkeley email, Google (@berkeley.edu), or password after email
        verification.
      </p>
      <SignInForm
        redirectTo={params.redirect ?? "/"}
        message={params.message}
        urlError={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </div>
  );
}
