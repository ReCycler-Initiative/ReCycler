import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";

function isRecyclerRoute(pathname: string) {
  return pathname === "/recycler" || pathname.startsWith("/recycler/");
}

// Public routes that do not require Auth0 at all.
function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/organizations/") ||
    pathname === "/api/materials" ||
    pathname === "/api/collection_spots" ||
    pathname.startsWith("/api/chat") ||
    pathname === "/recycler-login" ||
    pathname.startsWith("/api/recycler-auth") ||
    pathname.startsWith("/api/recycler-logout")
  );
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/recycler-login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

function hasBasicAuthSession(request: NextRequest) {
  return request.cookies.get(BASIC_AUTH_COOKIE)?.value === "1";
}



export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isRecyclerRoute(pathname)) {
    return hasBasicAuthSession(request) ? NextResponse.next() : redirectToLogin(request);
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
