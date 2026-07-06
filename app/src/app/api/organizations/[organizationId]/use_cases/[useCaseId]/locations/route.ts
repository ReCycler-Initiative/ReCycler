import db from "@/services/db";
import { DbLocation } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { z } from "zod";

const OptionalLocationString = z.string().trim().max(255).optional().or(z.literal(""));

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
        l.address AS location_address,
        l.postal_code AS location_postal_code,
        l.post_office AS location_post_office
      FROM recycler.locations l
      LEFT JOIN recycler.location_fields lf ON lf.location_id = l.id
      LEFT JOIN recycler.fields f ON f.id = lf.field_id
      WHERE l.use_case_id = ?::uuid
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
      address: loc.fields[0]?.location_address ?? undefined,
      id: loc.id,
      name: loc.name,
      fields: loc.fields.map((f) => ({
        id: f.field_id,
        name: f.field_name,
        field_type: f.field_type,
        order: f.field_order,
        value: f.field_values ?? [],
      })),
      post_office: loc.fields[0]?.location_post_office ?? undefined,
      postal_code: loc.fields[0]?.location_postal_code ?? undefined,
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
  address: OptionalLocationString,
  postal_code: OptionalLocationString,
  post_office: OptionalLocationString,
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
    address,
    postal_code,
    post_office,
    source_geometry,
    fieldValues,
  } = parsed.data;

  const row = await db.transaction(async (trx) => {
    let insertResult;
    if (source_geometry) {
      insertResult = await trx.raw(
        `
          INSERT INTO recycler.locations (name, use_case_id, geom, source_geom, address, postal_code, post_office)
          VALUES (?, ?::uuid, ST_SetSRID(ST_Point(?, ?), 4326), ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), ?, ?, ?)
          RETURNING id, name, address, postal_code, post_office,
            ST_AsGeoJSON(geom)::jsonb as geom,
            ST_AsGeoJSON(source_geom)::jsonb as source_geom
        `,
        [name, useCaseId, longitude, latitude, JSON.stringify(source_geometry), address || null, postal_code || null, post_office || null]
      );
    } else {
      insertResult = await trx.raw(
        `
          INSERT INTO recycler.locations (name, use_case_id, geom, address, postal_code, post_office)
          VALUES (?, ?::uuid, ST_SetSRID(ST_Point(?, ?), 4326), ?, ?, ?)
          RETURNING id, name, address, postal_code, post_office, ST_AsGeoJSON(geom)::jsonb as geom
        `,
        [name, useCaseId, longitude, latitude, address || null, postal_code || null, post_office || null]
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
      address: row.address ?? undefined,
      id: row.id,
      name: row.name,
      fields: [],
      post_office: row.post_office ?? undefined,
      postal_code: row.postal_code ?? undefined,
    },
  });
}
