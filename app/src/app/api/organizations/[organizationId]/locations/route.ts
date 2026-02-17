import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const result = await db.raw(
    `
    SELECT 
      l.id,
      l.name,
      ST_AsGeoJSON(l.geom)::jsonb as geom
    FROM recycler.locations l
    INNER JOIN recycler.use_cases uc ON l.use_case_id = uc.id
    WHERE uc.organization_id = ?::uuid
    ORDER BY l.name
  `,
    [organizationId]
  );

  const features = result.rows.map((row: any) => ({
    type: "Feature" as const,
    geometry: row.geom,
    properties: {
      id: row.id,
      name: row.name,
      fields: [],
    },
  }));

  const response = {
    type: "FeatureCollection" as const,
    features,
  };

  return NextResponse.json(response);
}
