import db from "@/services/db";
import { DbLocation } from "@/types";
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
    `SELECT * FROM recycler.get_locations(?::uuid)`,
    [useCaseId]
  );

  const rows = z.array(DbLocation).parse(result.rows);

  // get_locations returns one row per field (LEFT JOIN) — group by location
  const locationMap = new Map<
    string,
    { id: string; name: string; geom: unknown; fields: typeof rows }
  >();

  for (const row of rows) {
    if (!locationMap.has(row.location_id)) {
      locationMap.set(row.location_id, {
        id: row.location_id,
        name: row.location_name,
        geom: row.location_geom,
        fields: [],
      });
    }
    if (row.field_id) {
      locationMap.get(row.location_id)!.fields.push(row);
    }
  }

  const features = Array.from(locationMap.values()).map((loc) => ({
    type: "Feature" as const,
    geometry: loc.geom,
    properties: {
      id: loc.id,
      name: loc.name,
      fields: loc.fields.map((f) => ({
        id: f.field_id,
        name: f.field_name,
        field_type: f.field_type,
        order: f.field_order,
        value: f.field_values ?? [],
      })),
    },
  }));

  return NextResponse.json({
    type: "FeatureCollection" as const,
    features,
  });
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
