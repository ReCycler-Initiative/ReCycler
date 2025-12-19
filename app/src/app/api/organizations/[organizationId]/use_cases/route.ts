import db from "@/services/db";
import { UseCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { mapDbRowToUseCase } from "@/lib/mappers/use-case-mapper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  // Check authorization
  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const result = await db.raw(
    `SELECT * FROM recycler.use_cases f WHERE organization_id = ?`,
    [organizationId]
  );

  const transformedRows = result.rows.map(mapDbRowToUseCase);
  return NextResponse.json(z.array(UseCase).parse(transformedRows));
}
