import { NextResponse } from "next/server";
import { expireSoldListings } from "@/lib/expire-sold-listings";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const expired = await expireSoldListings(supabase, { throwOnError: true });
    return NextResponse.json({ ok: true, expired });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Expiry failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
