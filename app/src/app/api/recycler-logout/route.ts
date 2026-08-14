import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/recycler-login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(BASIC_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
