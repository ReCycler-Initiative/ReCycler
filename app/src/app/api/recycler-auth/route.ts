import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_USERNAME = process.env.RECYCLER_BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.RECYCLER_BASIC_AUTH_PASSWORD;
const BASIC_AUTH_COOKIE = "recycler_basic_auth_ok";

export async function POST(request: NextRequest) {
  // If no credentials are configured, allow anyone through.
  if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(BASIC_AUTH_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { username, password } = body;

  if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(BASIC_AUTH_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
