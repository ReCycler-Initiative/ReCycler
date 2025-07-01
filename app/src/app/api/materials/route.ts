import db from "@/services/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db("recycler.materials").orderBy("name");
  return NextResponse.json(result);
}
