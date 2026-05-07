import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { FieldRecord } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateFieldBody = z.object({
  name: z.string().trim().min(1),
  field_type: z.union([z.literal("multi_select"), z.literal("text_input"), z.literal("address"), z.literal("opening_hours")]),
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
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      fieldId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, fieldId } = await params;

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
    WHERE uc.organization_id = ?::uuid AND uc.id = ?::uuid AND f.id = ?::uuid
    `,
    [organizationId, useCaseId, fieldId]
  );

  const row = result.rows[0];
  if (!row) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  return NextResponse.json(FieldRecord.parse(row));
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      fieldId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, fieldId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const json = await request.json().catch(() => null);
  const parsed = UpdateFieldBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, field_type, required, options } = parsed.data;

  const result = await db.raw(
    `
    UPDATE recycler.fields f
    SET name = ?, field_type = ?, required = ?, options = ?::jsonb
    FROM recycler.use_cases uc
    WHERE f.use_case_id = uc.id
      AND uc.organization_id = ?::uuid
      AND uc.id = ?::uuid
      AND f.id = ?::uuid
    RETURNING f.*
    `,
    [
      name,
      field_type,
      required ?? false,
      options ? JSON.stringify(options) : null,
      organizationId,
      useCaseId,
      fieldId,
    ]
  );

  if (!result.rows[0]) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  return NextResponse.json(FieldRecord.parse(result.rows[0]));
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      fieldId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, fieldId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const result = await db.raw(
    `
    DELETE FROM recycler.fields f
    USING recycler.use_cases uc
    WHERE f.use_case_id = uc.id
      AND uc.organization_id = ?::uuid
      AND uc.id = ?::uuid
      AND f.id = ?::uuid
    RETURNING f.id
    `,
    [organizationId, useCaseId, fieldId]
  );

  if (!result.rows[0]) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
