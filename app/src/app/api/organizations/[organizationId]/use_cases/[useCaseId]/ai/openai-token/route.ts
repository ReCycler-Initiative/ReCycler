import { checkOrganizationAuthorization } from "@/lib/authorization";
import { encryptSecret } from "@/lib/crypto";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({
  organizationId: z.string().uuid(),
  useCaseId: z.string().uuid(),
});

const BodySchema = z.object({
  token: z.string().min(1),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const row = await db
    .select("openai_api_key_last4", "updated_at")
    .from("recycler.use_case_secrets")
    .where("use_case_id", useCaseId)
    .first();

  if (!row) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    last4: row.openai_api_key_last4,
    updatedAt: row.updated_at,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const body = BodySchema.parse(await request.json());
  const { ciphertext, last4 } = encryptSecret(body.token);

  await db("recycler.use_case_secrets")
    .insert({
      use_case_id: useCaseId,
      openai_api_key_ciphertext: ciphertext,
      openai_api_key_last4: last4,
      updated_at: new Date(),
    })
    .onConflict("use_case_id")
    .merge({
      openai_api_key_ciphertext: ciphertext,
      openai_api_key_last4: last4,
      updated_at: new Date(),
    });

  return NextResponse.json({ configured: true, last4 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  await db("recycler.use_case_secrets").where("use_case_id", useCaseId).del();

  return new NextResponse(null, { status: 204 });
}
