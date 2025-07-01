import * as chat from "@/services/chatbot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await chat.chat(body.message);

  return NextResponse.json({ message: response });
}
