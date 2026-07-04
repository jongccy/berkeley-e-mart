import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBerkeleyEmail, TERMS_ACKNOWLEDGED_COOKIE } from "@/lib/auth";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing auth code.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isBerkeleyEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Sign in with your UC Berkeley Google account (@berkeley.edu)."
      )}`
    );
  }

  const cookieStore = await cookies();
  const termsAcknowledged =
    cookieStore.get(TERMS_ACKNOWLEDGED_COOKIE)?.value === "1";

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email.split("@")[0];

  const profilePayload: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_verified_berkeley: boolean;
    terms_accepted_at?: string;
  } = {
    id: user.id,
    display_name: displayName,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    is_verified_berkeley: isVerifiedBerkeleyUser(user),
  };

  if (termsAcknowledged) {
    profilePayload.terms_accepted_at = new Date().toISOString();
  }

  await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("terms_accepted_at")
    .eq("id", user.id)
    .single();

  const redirectPath = !profile?.terms_accepted_at
    ? `/accept-terms?next=${encodeURIComponent(next)}`
    : next;

  const response = NextResponse.redirect(`${origin}${redirectPath}`);

  if (termsAcknowledged) {
    response.cookies.delete(TERMS_ACKNOWLEDGED_COOKIE);
  }

  return response;
}
