import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/events",
  "/missions",
  "/journeys",
  "/quizzes",
  "/prayer",
  "/memory-match",
  "/wordle",
  "/ludo",
  "/bible",
  "/guides",
  "/appointments",
  "/trivia",
  "/scan",
  "/mentorship",
  "/lions-den",
  "/noahs-ark"
];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const adminSession = request.cookies.get("admin_session");
  const path = request.nextUrl.pathname;

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtected && !session && !adminSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect admin routes
  if (path.startsWith("/admin") && path !== "/admin" && !adminSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
