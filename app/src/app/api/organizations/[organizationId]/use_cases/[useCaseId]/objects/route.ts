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

  const result = await db.raw(
    `
    INSERT INTO recycler.objects (name, use_case_id)
    VALUES (?::text, ?::uuid)
    RETURNING *, '[]'::json as fields
    `,
    [data.name, useCaseId]
  );

  return NextResponse.json(ObjectRecord.parse(result.rows[0]), { status: 201 });
}
