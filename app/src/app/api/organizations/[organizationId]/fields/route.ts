import db from "@/services/db";
import { FieldRecord } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * @deprecated Fields are scoped to use cases, not organizations.
 * Use /api/organizations/[organizationId]/use_cases/[useCaseId]/fields instead.
 * This route returns fields for all use cases belonging to the organization.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const result = await db.raw(
    `
    SELECT f.*
    FROM recycler.fields f
    INNER JOIN recycler.use_cases uc ON f.use_case_id = uc.id
    WHERE uc.organization_id = ?::uuid
    ORDER BY f.order
    `,
    [organizationId]
  );

  return NextResponse.json(z.array(FieldRecord).parse(result.rows));
}
