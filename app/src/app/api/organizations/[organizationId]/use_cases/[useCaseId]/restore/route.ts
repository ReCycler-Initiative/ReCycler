import { checkOrganizationAuthorization } from "@/lib/authorization";
import { mapDbRowToUseCase } from "@/lib/mappers/use-case-mapper";
import db from "@/services/db";
import { UseCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;
  const authResult = await checkOrganizationAuthorization(request, organizationId);

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const restoredUseCase = await db("recycler.use_cases")
    .where({ id: useCaseId, organization_id: organizationId })
    .whereNotNull("deleted_at")
    .update({ deleted_at: null, updated_at: new Date() })
    .returning("*")
    .then((rows: any[]) => rows[0]);

  if (!restoredUseCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  return NextResponse.json(UseCase.parse(mapDbRowToUseCase(restoredUseCase)));
}