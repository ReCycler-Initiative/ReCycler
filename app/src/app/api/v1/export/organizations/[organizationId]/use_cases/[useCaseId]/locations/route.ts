import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { DbLocation } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;
  const authorization = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authorization.authorized) {
    return authorization.response!;
  }

  const result = await db.raw(
    `
      SELECT
        f.id AS field_id,
        f.name AS field_name,
        f.order AS field_order,
        f.field_type,
        lf.value AS field_values,
        ST_AsGeoJSON(l.geom)::jsonb AS location_geom,
        ST_AsGeoJSON(l.source_geom)::jsonb AS location_source_geom,
        l.id AS location_id,
        l.name AS location_name,
        l.address AS location_address,
        l.postal_code AS location_postal_code,
        l.post_office AS location_post_office
      FROM recycler.locations l
      INNER JOIN recycler.use_cases uc ON uc.id = l.use_case_id
      LEFT JOIN recycler.location_fields lf ON lf.location_id = l.id
      LEFT JOIN recycler.fields f ON f.id = lf.field_id
      WHERE uc.id = ?::uuid AND uc.organization_id = ?::uuid
      ORDER BY l.name, f.order NULLS LAST;
    `,
    [useCaseId, organizationId]
  );

  const rows = z.array(DbLocation).parse(result.rows);
  const locations = new Map<
    string,
    { id: string; name: string; geom: unknown; sourceGeom: unknown; fields: typeof rows }
  >();

  for (const row of rows) {
    if (!locations.has(row.location_id)) {
      locations.set(row.location_id, {
        id: row.location_id,
        name: row.location_name,
        geom: row.location_geom,
        sourceGeom: row.location_source_geom,
        fields: [],
      });
    }

    if (row.field_id) {
      locations.get(row.location_id)!.fields.push(row);
    }
  }

  return NextResponse.json({
    type: "FeatureCollection" as const,
    features: Array.from(locations.values()).map((location) => ({
      type: "Feature" as const,
      geometry: location.geom,
      properties: {
        address: location.fields[0]?.location_address ?? undefined,
        id: location.id,
        name: location.name,
        fields: location.fields.map((field) => ({
          id: field.field_id,
          name: field.field_name,
          field_type: field.field_type,
          order: field.field_order,
          value: field.field_values ?? [],
        })),
        post_office: location.fields[0]?.location_post_office ?? undefined,
        postal_code: location.fields[0]?.location_postal_code ?? undefined,
        source_geometry: location.sourceGeom ?? undefined,
      },
    })),
  });
}