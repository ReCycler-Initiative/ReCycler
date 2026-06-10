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
  const data = Object.parse(body);

  const result = await db.raw(
    `
    UPDATE recycler.objects o
    SET name = ?::text
    FROM recycler.use_cases uc
    WHERE o.id = ?::uuid 
      AND o.use_case_id = uc.id
      AND uc.id = ?::uuid 
      AND uc.organization_id = ?::uuid
    RETURNING o.*, '[]'::json as fields
    `,
    [data.name, objectId, useCaseId, organizationId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Object not found" }, { status: 404 });
  }

  return NextResponse.json(ObjectRecord.parse(result.rows[0]));
}
