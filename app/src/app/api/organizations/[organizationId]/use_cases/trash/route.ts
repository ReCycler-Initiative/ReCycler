import { checkOrganizationAuthorization } from "@/lib/authorization";
import { mapDbRowToUseCase } from "@/lib/mappers/use-case-mapper";
import db from "@/services/db";
import { UseCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

  const authResult = await checkOrganizationAuthorization(request, organizationId);

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const result = await db("recycler.use_cases")
    .select("*")
    .where("organization_id", organizationId)
    .whereNotNull("deleted_at")
    .orderBy("deleted_at", "desc");

  return NextResponse.json(
    z.array(UseCase).parse(result.map(mapDbRowToUseCase))
  );
}