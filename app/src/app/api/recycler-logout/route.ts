import { NextResponse } from "next/server";

const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/recycler-login", process.env.APP_BASE_URL ?? "http://localhost:3000")
  );
  response.cookies.set(BASIC_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
