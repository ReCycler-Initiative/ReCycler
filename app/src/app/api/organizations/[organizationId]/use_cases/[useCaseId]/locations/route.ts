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
        lt.id AS location_type_id,
        lt.name AS location_type_name
      FROM recycler.locations l
      LEFT JOIN LATERAL (
        -- Locations aren't linked to a type directly: use the type whose fields hold its values
        SELECT o.id, o.name
        FROM recycler.objects o
        LEFT JOIN recycler.fields tf ON tf.object_id = o.id
        LEFT JOIN recycler.location_fields tlf
          ON tlf.field_id = tf.id AND tlf.location_id = l.id
        WHERE o.use_case_id = l.use_case_id
        GROUP BY o.id
        ORDER BY count(tlf.field_id) DESC, o.created_at NULLS LAST
        LIMIT 1
      ) lt ON true
      LEFT JOIN recycler.location_fields lf ON lf.location_id = l.id
      LEFT JOIN recycler.fields f ON f.id = lf.field_id
      WHERE l.use_case_id = ?::uuid
        AND l.geom IS NOT NULL
      ORDER BY l.name, f.order NULLS LAST;
    `,
    [useCaseId]
  );

  const rows = z.array(DbLocation).parse(result.rows);

  // get_locations returns one row per field (LEFT JOIN) — group by location
  const locationMap = new Map<
    string,
    {
      id: string;
      name: string;
      typeId: string | null;
      typeName: string | null;
      geom: unknown;
      sourceGeom: unknown;
      fields: typeof rows;
    }
  >();

  for (const row of rows) {
    if (!locationMap.has(row.location_id)) {
      locationMap.set(row.location_id, {
        id: row.location_id,
        name: row.location_name,
        typeId: row.location_type_id ?? null,
        typeName: row.location_type_name ?? null,
        geom: row.location_geom,
        sourceGeom: row.location_source_geom,
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
      location_type_id: loc.typeId ?? undefined,
      location_type_name: loc.typeName ?? undefined,
      fields: loc.fields.map((f) => ({
        id: f.field_id,
        name: f.field_name,
        field_type: f.field_type,
        order: f.field_order,
        value: f.field_values ?? [],
      })),
      source_geometry: loc.sourceGeom ?? undefined,
    },
  }));

  return NextResponse.json({
    type: "FeatureCollection" as const,
    features,
  });
}

const GeoJsonGeometry = z.object({
  type: z.string(),
  coordinates: z.unknown(),
});

const CreateLocationBody = z.object({
  longitude: z.number().finite(),
  latitude: z.number().finite(),
  name: z.string().trim().min(1),
  source_geometry: GeoJsonGeometry.optional(),
  fieldValues: z
    .array(
      z.object({
        fieldId: z.string().uuid(),
        values: z.array(z.string()),
      })
    )
    .optional(),
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

  const {
    longitude,
    latitude,
    name,
    source_geometry,
    fieldValues,
  } = parsed.data;

  const row = await db.transaction(async (trx) => {
    let insertResult;
    if (source_geometry) {
      insertResult = await trx.raw(
        `
          INSERT INTO recycler.locations (name, use_case_id, geom, source_geom)
          VALUES (?, ?::uuid, ST_SetSRID(ST_Point(?, ?), 4326), ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))
          RETURNING id, name,
            ST_AsGeoJSON(geom)::jsonb as geom,
            ST_AsGeoJSON(source_geom)::jsonb as source_geom
        `,
        [name, useCaseId, longitude, latitude, JSON.stringify(source_geometry)]
      );
    } else {
      insertResult = await trx.raw(
        `
          INSERT INTO recycler.locations (name, use_case_id, geom)
          VALUES (?, ?::uuid, ST_SetSRID(ST_Point(?, ?), 4326))
          RETURNING id, name, ST_AsGeoJSON(geom)::jsonb as geom
        `,
        [name, useCaseId, longitude, latitude]
      );
    }

    const createdRow = insertResult.rows[0];

    if (fieldValues && fieldValues.length > 0) {
      await trx("recycler.location_fields").insert(
        fieldValues.map(({ fieldId, values }) => ({
          id: trx.raw("uuid_generate_v4()"),
          location_id: createdRow.id,
          field_id: fieldId,
          value: JSON.stringify(values),
        }))
      );
    }

    return createdRow;
  });

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
