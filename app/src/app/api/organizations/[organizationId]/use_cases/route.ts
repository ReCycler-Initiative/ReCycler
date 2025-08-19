import db from "@/services/db";
import { UseCase } from "@/types";
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
    `SELECT * FROM recycler.use_cases f WHERE organization_id = ?`,
    [organizationId]
  );

  return NextResponse.json(z.array(UseCase).parse(result.rows));
}
