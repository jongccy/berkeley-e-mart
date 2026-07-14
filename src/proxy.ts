import { NextResponse, type NextRequest } from "next/server";
import { CANONICAL_SITE_URL } from "@/lib/auth";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  // Keep users on the custom domain instead of the Vercel deployment URL.
  if (
    process.env.VERCEL_ENV === "production" &&
    host.endsWith(".vercel.app")
  ) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`${CANONICAL_SITE_URL}${pathname}${search}`, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
