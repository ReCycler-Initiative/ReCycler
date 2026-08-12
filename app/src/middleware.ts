import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const BASIC_AUTH_USERNAME = process.env.RECYCLER_BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.RECYCLER_BASIC_AUTH_PASSWORD;
const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";

const BASIC_AUTH_REALM = 'ReCycler Demo';

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
    pathname.startsWith("/auth/")
  );
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"`,
    },
  });
}

function hasBasicAuthSession(request: NextRequest) {
  return request.cookies.get(BASIC_AUTH_COOKIE)?.value === "1";
}

function allowRecyclerDemo() {
  const response = NextResponse.next();
  response.cookies.set(BASIC_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}

function isBasicAuthValid(request: NextRequest) {
  if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  try {
    const encoded = authHeader.slice("Basic ".length);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return false;
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isRecyclerRoute(pathname)) {
    if (hasBasicAuthSession(request)) {
      return NextResponse.next();
    }

    return isBasicAuthValid(request) ? allowRecyclerDemo() : unauthorized();
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
