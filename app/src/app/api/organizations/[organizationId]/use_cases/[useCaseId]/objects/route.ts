import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { ObjectRecord } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const result = await db.raw(
    `
    SELECT f.*
    FROM recycler.objects f
    INNER JOIN recycler.use_cases uc ON f.use_case_id = uc.id
    WHERE uc.organization_id = ?::uuid AND uc.id = ?::uuid
    ORDER BY f.created_at
    `,
    [organizationId, useCaseId]
  );

  return NextResponse.json(z.array(ObjectRecord).parse(result.rows));
}
