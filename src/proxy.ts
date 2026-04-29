import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/account", "/admin"] as const;

/**
 * Edge proxy (Next 16) — gates auth-only routes by presence of session cookie.
 * Full session decoding happens in server components / route handlers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!requiresAuth) return NextResponse.next();

  const sessionCookie = request.cookies.get("neurodrop.session_token");
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
