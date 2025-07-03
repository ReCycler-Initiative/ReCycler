import db from "@/services/db";
import { Field } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  const result = await db.raw(
    `SELECT * FROM recycler.fields f WHERE organization_id = ? ORDER BY f.order`,
    [organizationId]
  );

  return NextResponse.json(z.array(Field).parse(result.rows));
}
