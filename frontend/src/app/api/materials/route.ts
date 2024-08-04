import db from "@/services/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db("recycler.materials").orderBy("material_name");
  return NextResponse.json(result);
}
