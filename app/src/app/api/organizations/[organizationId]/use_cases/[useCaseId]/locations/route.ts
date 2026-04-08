import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string, useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

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
    WHERE uc.organization_id = ?::uuid AND uc.id = ?::uuid
    ORDER BY l.name
  `,
    [organizationId, useCaseId]
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

const CreateLocationBody = z.object({
  longitude: z.number().finite(),
  latitude: z.number().finite(),
  name: z.string().trim().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const json = await request.json().catch(() => null);
  const parsed = CreateLocationBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Ensure the use case belongs to the organization
  const useCase = await db("recycler.use_cases")
    .select("id")
    .where({ id: useCaseId, organization_id: organizationId })
    .first();

  if (!useCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const { longitude, latitude, name } = parsed.data;

  const insertResult = await db.raw(
    `
      INSERT INTO recycler.locations (name, use_case_id, geom)
      VALUES (?, ?::uuid, ST_SetSRID(ST_Point(?, ?), 4326))
      RETURNING id, name, ST_AsGeoJSON(geom)::jsonb as geom
    `,
    [name, useCaseId, longitude, latitude]
  );

  const row = insertResult.rows[0];

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
