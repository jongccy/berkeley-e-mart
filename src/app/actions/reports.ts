"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAuthenticatedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { REPORT_REASONS, type ReportReason } from "@/lib/report-reasons";

export type ReportFormState = {
  error?: string;
  success?: boolean;
};

const VALID_REASONS = new Set<string>(REPORT_REASONS.map((reason) => reason.value));

function parseReason(value: string): ReportReason | null {
  const reason = value.trim();
  return VALID_REASONS.has(reason) ? (reason as ReportReason) : null;
}

function parseDetails(value: string): string | null {
  const details = value.trim();
  return details ? details.slice(0, 1000) : null;
}

function duplicateReportMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "You already submitted a report for this.";
  }
  return error.message;
}

export async function reportListingFromForm(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const reason = parseReason(String(formData.get("reason") ?? ""));
  const details = parseDetails(String(formData.get("details") ?? ""));

  if (!listingId) return { error: "Missing listing." };
  if (!reason) return { error: "Choose a reason for your report." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthenticatedBerkeleyUser(user)) {
    return { error: "Log in with your Berkeley account to report listings." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return { error: "Listing not found." };
  if (listing.seller_id === user.id) {
    return { error: "You cannot report your own listing." };
  }

  const { error } = await supabase.from("listing_reports").insert({
    reporter_id: user.id,
    listing_id: listingId,
    reason,
    details,
  });

  if (error) {
    return { error: duplicateReportMessage(error) };
  }

  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function reportUserFromForm(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const reportedUserId = String(formData.get("reported_user_id") ?? "").trim();
  const listingId = String(formData.get("listing_id") ?? "").trim() || null;
  const conversationId =
    String(formData.get("conversation_id") ?? "").trim() || null;
  const reason = parseReason(String(formData.get("reason") ?? ""));
  const details = parseDetails(String(formData.get("details") ?? ""));

  if (!reportedUserId) return { error: "Missing user." };
  if (!reason) return { error: "Choose a reason for your report." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthenticatedBerkeleyUser(user)) {
    return { error: "Log in with your Berkeley account to report users." };
  }

  if (reportedUserId === user.id) {
    return { error: "You cannot report yourself." };
  }

  const { error } = await supabase.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    listing_id: listingId,
    conversation_id: conversationId,
    reason,
    details,
  });

  if (error) {
    return { error: duplicateReportMessage(error) };
  }

  if (conversationId) {
    revalidatePath(`/inbox/${conversationId}`);
  }
  if (listingId) {
    revalidatePath(`/listings/${listingId}`);
  }

  return { success: true };
}
