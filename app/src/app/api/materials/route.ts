import db from "@/services/db";
import { resolveLocale } from "@/i18n/locale-config";
import { localizeMaterials } from "@/lib/material-translations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
  const result = await db("recycler.materials").orderBy("name");
  return NextResponse.json(localizeMaterials(result, locale));
}
