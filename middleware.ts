import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple cookie-based session guard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const publicPaths = ["/auth", "/api/auth/setup", "/api/auth/login", "/api/auth/logout", "/api/auth/status", "/_next", "/favicon.ico", "/api/health"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const session = request.cookies.get("session")?.value;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
