"use server";

import { redirect } from "next/navigation";
import { isBerkeleyEmail, normalizeEmail, getSiteUrl } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { error: "Email is required." };
  }

  if (!isBerkeleyEmail(email)) {
    return {
      error:
        "Use a UC Berkeley email (e.g. you@berkeley.edu or you@haas.berkeley.edu).",
    };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    return {
      success:
        "Account created. Check your Berkeley email for a verification link, then log in.",
    };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    success:
      "If this email is valid, you will receive a verification link shortly.",
  };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!isBerkeleyEmail(email)) {
    return {
      error:
        "Use a UC Berkeley email (e.g. you@berkeley.edu or you@haas.berkeley.edu).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Email not verified yet. Check your inbox for the confirmation link from Supabase.",
      };
    }
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function acceptTerms(
  formData: FormData
): Promise<AuthFormState | void> {
  const agreed = formData.get("agreed") === "on";
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!agreed) {
    return { error: "You must agree to the Terms of Service and Privacy Policy." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}
