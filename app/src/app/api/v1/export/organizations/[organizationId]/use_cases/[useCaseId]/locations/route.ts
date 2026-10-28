import { checkExportAuthorization } from "@/lib/export-authorization";
import db from "@/services/db";
import { DbLocation } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;
  const authorization = await checkExportAuthorization(
    request,
    organizationId
  );

  if (!authorization.authorized) {
    return authorization.response!;
  }

  const objectIdParam = request.nextUrl.searchParams.get("object_id");
  const objectId = objectIdParam ? z.string().uuid().safeParse(objectIdParam) : null;
  if (objectId && !objectId.success) {
    return NextResponse.json({ error: "Invalid object_id" }, { status: 400 });
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
        o.id AS object_id,
        o.name AS object_name
      FROM recycler.locations l
      INNER JOIN recycler.use_cases uc ON uc.id = l.use_case_id
      LEFT JOIN recycler.objects o ON o.id = l.object_id
      LEFT JOIN recycler.location_fields lf ON lf.location_id = l.id
      LEFT JOIN recycler.fields f ON f.id = lf.field_id
      WHERE uc.id = ?::uuid AND uc.organization_id = ?::uuid
        AND (?::uuid IS NULL OR l.object_id = ?::uuid)
      ORDER BY l.name, f.order NULLS LAST;
    `,
    [useCaseId, organizationId, objectId?.data ?? null, objectId?.data ?? null]
  );

  const rows = z.array(DbLocation).parse(result.rows);
  const locations = new Map<
    string,
    {
      id: string;
      name: string;
      objectId: string | null;
      objectName: string | null;
      geom: unknown;
      sourceGeom: unknown;
      fields: typeof rows;
    }
  >();

  for (const row of rows) {
    if (!locations.has(row.location_id)) {
      locations.set(row.location_id, {
        id: row.location_id,
        name: row.location_name,
        objectId: row.object_id ?? null,
        objectName: row.object_name ?? null,
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
        id: location.id,
        name: location.name,
        object_id: location.objectId ?? undefined,
        object_name: location.objectName ?? undefined,
        fields: location.fields.map((field) => ({
          id: field.field_id,
          name: field.field_name,
          field_type: field.field_type,
          order: field.field_order,
          value: field.field_values ?? [],
        })),
        source_geometry: location.sourceGeom ?? undefined,
      },
    })),
  });
}