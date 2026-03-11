import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({
  organizationId: z.string().uuid(),
  useCaseId: z.string().uuid(),
  materialId: z.string().uuid(),
});

async function assertUseCaseInOrg(organizationId: string, useCaseId: string) {
  const useCase = await db
    .select("id")
    .from("recycler.use_cases")
    .where("id", useCaseId)
    .andWhere("organization_id", organizationId)
    .first();

  return !!useCase;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId, materialId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const deleted = await db("recycler.use_case_training_materials")
    .where("id", materialId)
    .andWhere("use_case_id", useCaseId)
    .del();

  if (!deleted) {
    return NextResponse.json({ error: "Training material not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
