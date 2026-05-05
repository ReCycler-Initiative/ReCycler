import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { FieldRecord } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateFieldBody = z.object({
  name: z.string().trim().min(1),
  field_type: z.union([z.literal("multi_select"), z.literal("text_input")]),
  required: z.boolean().default(false),
  options: z
    .object({
      choices: z.array(z.string()).optional(),
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      choiceColors: z.record(z.string()).optional(),
    })
    .nullable()
    .optional(),
});

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; useCaseId: string }> }
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
    FROM recycler.fields f
    INNER JOIN recycler.use_cases uc ON f.use_case_id = uc.id
    WHERE uc.organization_id = ?::uuid AND uc.id = ?::uuid
    ORDER BY f.order NULLS LAST, f.created_at
    `,
    [organizationId, useCaseId]
  );

  return NextResponse.json(z.array(FieldRecord).parse(result.rows));
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const json = await request.json().catch(() => null);
  const parsed = CreateFieldBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const useCase = await db("recycler.use_cases")
    .select("id")
    .where({ id: useCaseId, organization_id: organizationId })
    .first();
  if (!useCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const maxRow = await db("recycler.fields")
    .where({ use_case_id: useCaseId })
    .max("order as max")
    .first();
  const nextOrder = (maxRow?.max ?? 0) + 1;

  const { name, field_type, required, options } = parsed.data;

  const [row] = await db("recycler.fields")
    .insert({
      id: db.raw("uuid_generate_v4()"),
      use_case_id: useCaseId,
      name,
      field_type,
      required: required ?? false,
      options: options ? JSON.stringify(options) : null,
      order: nextOrder,
      created_at: db.fn.now(),
    })
    .returning("*");

  return NextResponse.json(FieldRecord.parse(row), { status: 201 });
}
