const ALLOWED_RETURN_PATHS = ["/signup", "/login", "/accept-terms"];

export function sanitizeReturnTo(from: string | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/signup";
  }

  const pathname = from.split("?")[0];
  if (!ALLOWED_RETURN_PATHS.includes(pathname)) {
    return "/signup";
  }

  return from;
}

export function legalPageHref(
  page: "/terms" | "/privacy",
  returnTo: string
): string {
  return `${page}?from=${encodeURIComponent(returnTo)}`;
}

export function legalBackLabel(returnTo: string): string {
  const pathname = returnTo.split("?")[0];

  if (pathname === "/signup") return "← Back to sign up";
  if (pathname === "/login") return "← Back to log in";
  if (pathname === "/accept-terms") return "← Back";

  return "← Back to sign up";
}
