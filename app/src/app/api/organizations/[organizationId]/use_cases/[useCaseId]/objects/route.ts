import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { ObjectRecord, Object } from "@/types";
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
    SELECT 
      o.*,
      COALESCE(
        json_agg(
          f.* ORDER BY f.created_at
        ) FILTER (WHERE f.id IS NOT NULL),
        '[]'
      ) as fields
    FROM recycler.objects o
    INNER JOIN recycler.use_cases uc ON o.use_case_id = uc.id
    LEFT JOIN recycler.fields f ON f.object_id = o.id
    WHERE uc.organization_id = ?::uuid AND uc.id = ?::uuid
    GROUP BY o.id
    ORDER BY o.created_at
    `,
    [organizationId, useCaseId]
  );

  return NextResponse.json(z.array(ObjectRecord).parse(result.rows));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const body = await request.json();
  const data = Object.parse(body);

  // Insert object
  const objectResult = await db.raw(
    `
    INSERT INTO recycler.objects (name, use_case_id)
    VALUES (?::text, ?::uuid)
    RETURNING *
    `,
    [data.name, useCaseId]
  );

  const newObject = objectResult.rows[0];

  // Insert fields
  const fields = await Promise.all(
    data.fields.map(async (field, index) => {
      const [row] = await db("recycler.fields")
        .insert({
          id: db.raw("uuid_generate_v4()"),
          object_id: newObject.id, // Linkitä objektiin
          use_case_id: useCaseId,
          name: field.name,
          field_type: field.field_type,
          required: field.required ?? false,
          options: field.options ? JSON.stringify(field.options) : null,
          order: index, // tai field.order
          created_at: db.fn.now(),
        })
        .returning("*");

      return row;
    })
  );

  return NextResponse.json(ObjectRecord.parse({ ...newObject, fields }), {
    status: 201,
  });
}
