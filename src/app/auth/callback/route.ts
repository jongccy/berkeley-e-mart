import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBerkeleyEmail } from "@/lib/auth";

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

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email.split("@")[0];

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id" }
  );

  return NextResponse.redirect(`${origin}${next}`);
}
