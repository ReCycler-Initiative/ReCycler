import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";
const AUTH0_SESSION_COOKIES = new Set(["__session", "appSession"]);

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

function clearStaleAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (AUTH0_SESSION_COOKIES.has(name) || name.startsWith("__txn_")) {
      response.cookies.set(name, "", {
        httpOnly: true,
        sameSite: "lax",
        secure:
          request.nextUrl.protocol === "https:" ||
          request.headers.get("x-forwarded-proto") === "https",
        path: "/",
        maxAge: 0,
      });
    }
  }
}



export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isRecyclerRoute(pathname)) {
    return hasBasicAuthSession(request) ? NextResponse.next() : redirectToLogin(request);
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    return await auth0.middleware(request);
  } catch (error) {
    if ((error as { code?: string })?.code !== "ERR_JWE_DECRYPTION_FAILED") {
      throw error;
    }

    if (pathname === "/auth/profile") {
      const response = NextResponse.json({ user: null }, { status: 401 });
      clearStaleAuthCookies(request, response);
      return response;
    }

    const response = pathname.startsWith("/auth/")
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.redirect(
          new URL(
            `/auth/login?returnTo=${encodeURIComponent(
              `${pathname}${request.nextUrl.search}`
            )}`,
            request.url
          )
        );

    clearStaleAuthCookies(request, response);
    return response;
  }
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
