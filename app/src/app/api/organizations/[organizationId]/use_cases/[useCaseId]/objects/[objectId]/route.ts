import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { Object, ObjectRecord } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      objectId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, objectId } = await params;

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
    WHERE uc.organization_id = ?::uuid 
      AND uc.id = ?::uuid 
      AND o.id = ?::uuid
    GROUP BY o.id
    `,
    [organizationId, useCaseId, objectId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Object not found" }, { status: 404 });
  }

  return NextResponse.json(ObjectRecord.parse(result.rows[0]));
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      objectId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, objectId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const body = await request.json();
  const data = ObjectRecord.parse(body);

  // Update object
  const result = await db.raw(
    `
    UPDATE recycler.objects o
    SET name = ?::text
    FROM recycler.use_cases uc
    WHERE o.id = ?::uuid 
      AND o.use_case_id = uc.id
      AND uc.id = ?::uuid 
      AND uc.organization_id = ?::uuid
    RETURNING o.*
    `,
    [data.name, objectId, useCaseId, organizationId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Object not found" }, { status: 404 });
  }

  const updatedObject = result.rows[0];

  // Get existing fields
  const existingFields = await db("recycler.fields")
    .where({ object_id: objectId })
    .select("id");

  const existingFieldIds = new Set(existingFields.map((f) => f.id));
  const incomingFieldIds = new Set(
    data.fields
      .filter((f) => "id" in f && f.id)
      .map((f) => ("id" in f ? f.id : ""))
  );

  // Delete removed fields
  const fieldsToDelete = [...existingFieldIds].filter(
    (id) => !incomingFieldIds.has(id)
  );
  if (fieldsToDelete.length > 0) {
    await db("recycler.fields").whereIn("id", fieldsToDelete).delete();
  }

  // Update or insert fields
  const fields = await Promise.all(
    data.fields.map(async (field, index) => {
      if ("id" in field && field.id) {
        // Update existing field
        const [row] = await db("recycler.fields")
          .where({ id: field.id })
          .update({
            name: field.name,
            field_type: field.field_type,
            required: field.required ?? false,
            options: field.options ? JSON.stringify(field.options) : null,
            order: index,
          })
          .returning("*");

        return row;
      } else {
        // Insert new field
        const [row] = await db("recycler.fields")
          .insert({
            id: db.raw("uuid_generate_v4()"),
            object_id: objectId,
            use_case_id: useCaseId,
            name: field.name,
            field_type: field.field_type,
            required: field.required ?? false,
            options: field.options ? JSON.stringify(field.options) : null,
            order: index,
            created_at: db.fn.now(),
          })
          .returning("*");

        return row;
      }
    })
  );

  return NextResponse.json(
    ObjectRecord.parse({ ...updatedObject, fields, use_case_id: useCaseId })
  );
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
    }>;
  }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const body = await request.json();
  const data = Object.parse(body);

  const result = await db.raw(
    `
    INSERT INTO recycler.objects (use_case_id, name)
    SELECT uc.id, ?::text
    FROM recycler.use_cases uc
    WHERE uc.id = ?::uuid 
      AND uc.organization_id = ?::uuid
    RETURNING *, '[]'::json as fields
    `,
    [data.name, useCaseId, organizationId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  return NextResponse.json(ObjectRecord.parse(result.rows[0]), { status: 201 });
}
