import db from "@/services/db";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { organizationId: string[] } }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  const result = await db.raw(
    `SELECT * FROM recycler.fields WHERE organization_id = ?`,
    [organizationId]
  );

  return NextResponse.json(result.rows);
}
