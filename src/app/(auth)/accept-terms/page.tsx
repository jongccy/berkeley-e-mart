import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/AuthCard";
import { AcceptTermsForm } from "@/components/AcceptTermsForm";

export default async function AcceptTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("terms_accepted_at")
    .eq("id", user.id)
    .single();

  if (profile?.terms_accepted_at) {
    redirect(params.next ?? "/");
  }

  return (
    <AuthCard
      title="Before you continue"
      subtitle="Please review and accept our terms to use Calket"
    >
      <AcceptTermsForm
        redirectTo={params.next ?? "/"}
        error={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </AuthCard>
  );
}
