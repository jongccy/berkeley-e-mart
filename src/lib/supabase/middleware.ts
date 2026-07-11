import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const authPaths = ["/login", "/signup", "/accept-terms", "/auth/callback"];
  const isAuthPath = authPaths.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  );

  const protectedPrefixes = [
    "/listings/new",
    "/inbox",
    "/profile/me",
    "/wanted/new",
  ];
  const isListingEdit = /^\/listings\/[^/]+\/edit$/.test(path);
  const isProtected =
    isListingEdit ||
    protectedPrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );

  if (isProtected && !user && !isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && isProtected && !isAuthPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("terms_accepted_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.terms_accepted_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/accept-terms";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
