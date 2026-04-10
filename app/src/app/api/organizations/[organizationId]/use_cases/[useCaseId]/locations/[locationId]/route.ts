import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      locationId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, locationId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  const row = (
    await db.raw(
      `
        SELECT
          l.id,
          l.name,
          ST_AsGeoJSON(l.geom)::jsonb as geom
        FROM recycler.locations l
        INNER JOIN recycler.use_cases uc ON l.use_case_id = uc.id
        WHERE uc.organization_id = ?::uuid
          AND uc.id = ?::uuid
          AND l.id = ?::uuid
        LIMIT 1;
      `,
      [organizationId, useCaseId, locationId]
    )
  ).rows[0];

  if (!row) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({
    type: "Feature" as const,
    geometry: row.geom,
    properties: {
      id: row.id,
      name: row.name,
      fields: [],
    },
  });
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      useCaseId: string;
      locationId: string;
    }>;
  }
) {
  const { organizationId, useCaseId, locationId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const deleted = await db.raw(
    `
      DELETE FROM recycler.locations l
      USING recycler.use_cases uc
      WHERE l.use_case_id = uc.id
        AND uc.organization_id = ?::uuid
        AND uc.id = ?::uuid
        AND l.id = ?::uuid
      RETURNING l.id;
    `,
    [organizationId, useCaseId, locationId]
  );

  if (!deleted.rows?.[0]) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
