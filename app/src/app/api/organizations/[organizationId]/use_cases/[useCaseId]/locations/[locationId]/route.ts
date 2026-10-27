import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { z } from "zod";

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

  const rows = (
    await db.raw(
      `
        SELECT
          l.id,
          l.name,
          ds.name AS datasource_name,
          lt.id AS location_type_id,
          lt.name AS location_type_name,
          CASE
            WHEN l.datasource_id IS NULL THEN 'manual'
            ELSE 'datasource'
          END AS source_type,
          ST_AsGeoJSON(l.geom)::jsonb as geom,
          ST_AsGeoJSON(l.source_geom)::jsonb as source_geom,
          f.id         AS field_id,
          f.name       AS field_name,
          f.field_type,
          f.options,
          f.required,
          f.order      AS field_order,
          lf.value     AS field_value
        FROM recycler.locations l
        INNER JOIN recycler.use_cases uc ON l.use_case_id = uc.id
        LEFT JOIN recycler.datasources ds ON l.datasource_id = ds.id
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
        LEFT JOIN recycler.fields f ON f.use_case_id = uc.id
        LEFT JOIN recycler.location_fields lf
          ON lf.location_id = l.id AND lf.field_id = f.id
        WHERE uc.organization_id = ?::uuid
          AND uc.id = ?::uuid
          AND l.id = ?::uuid
        ORDER BY f.order;
      `,
      [organizationId, useCaseId, locationId]
    )
  ).rows;

  if (!rows.length) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const first = rows[0];
  const fields = rows
    .filter((r: any) => r.field_id)
    .map((r: any) => ({
      id: r.field_id,
      name: r.field_name,
      field_type: r.field_type,
      options: r.options,
      required: r.required ?? false,
      order: r.field_order,
      value: r.field_value ?? [],
    }));

  return NextResponse.json({
    type: "Feature" as const,
    geometry: first.geom,
    properties: {
      datasource_name: first.datasource_name ?? undefined,
      id: first.id,
      name: first.name,
      location_type_id: first.location_type_id ?? undefined,
      location_type_name: first.location_type_name ?? undefined,
      fields,
      source_type: first.source_type ?? undefined,
      source_geometry: first.source_geom ?? undefined,
    },
  });
}

const GeoJsonGeometry = z.object({
  type: z.string(),
  coordinates: z.unknown(),
});

const UpdateLocationBody = z.object({
  name: z.string().trim().min(1),
  longitude: z.number().finite(),
  latitude: z.number().finite(),
  source_geometry: GeoJsonGeometry.nullable().optional(),
  fieldValues: z
    .array(
      z.object({
        fieldId: z.string().uuid(),
        values: z.array(z.string()),
      })
    )
    .optional(),
});

export async function PUT(
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

  const json = await request.json().catch(() => null);
  const parsed = UpdateLocationBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    name,
    longitude,
    latitude,
    source_geometry,
    fieldValues,
  } = parsed.data;

  const hasSourceGeometryField =
    json !== null && typeof json === "object" && "source_geometry" in json;

  const updated = await db.raw(
    hasSourceGeometryField && source_geometry
      ? `
          UPDATE recycler.locations l
          SET
            name = ?,
            geom = ST_SetSRID(ST_Point(?, ?), 4326),
            source_geom = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)
          FROM recycler.use_cases uc
          WHERE l.use_case_id = uc.id
            AND uc.organization_id = ?::uuid
            AND uc.id = ?::uuid
            AND l.id = ?::uuid
          RETURNING l.id;
        `
      : hasSourceGeometryField
        ? `
            UPDATE recycler.locations l
            SET
              name = ?,
              geom = ST_SetSRID(ST_Point(?, ?), 4326),
              source_geom = NULL
            FROM recycler.use_cases uc
            WHERE l.use_case_id = uc.id
              AND uc.organization_id = ?::uuid
              AND uc.id = ?::uuid
              AND l.id = ?::uuid
            RETURNING l.id;
          `
        : `
            UPDATE recycler.locations l
            SET
              name = ?,
              geom = ST_SetSRID(ST_Point(?, ?), 4326)
            FROM recycler.use_cases uc
            WHERE l.use_case_id = uc.id
              AND uc.organization_id = ?::uuid
              AND uc.id = ?::uuid
              AND l.id = ?::uuid
            RETURNING l.id;
          `,
    hasSourceGeometryField && source_geometry
      ? [
          name,
          longitude,
          latitude,
          JSON.stringify(source_geometry),
          organizationId,
          useCaseId,
          locationId,
        ]
      : [
          name,
          longitude,
          latitude,
          organizationId,
          useCaseId,
          locationId,
        ]
  );

  if (!updated.rows?.[0]) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  if (fieldValues && fieldValues.length > 0) {
    await db.raw(
      `DELETE FROM recycler.location_fields WHERE location_id = ?::uuid`,
      [locationId]
    );

    await db("recycler.location_fields").insert(
      fieldValues.map(({ fieldId, values }) => ({
        id: db.raw("uuid_generate_v4()"),
        location_id: locationId,
        field_id: fieldId,
        value: JSON.stringify(values),
      }))
    );
  }

  return NextResponse.json({ ok: true });
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
