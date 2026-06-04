import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { z } from "zod";

const OptionalLocationString = z.string().trim().max(255).optional().or(z.literal(""));

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
          l.address,
          l.postal_code,
          l.post_office,
          ds.name AS datasource_name,
          CASE
            WHEN l.datasource_id IS NULL THEN 'manual'
            ELSE 'datasource'
          END AS source_type,
          ST_AsGeoJSON(l.geom)::jsonb as geom,
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
      address: first.address ?? undefined,
      datasource_name: first.datasource_name ?? undefined,
      id: first.id,
      name: first.name,
      fields,
      post_office: first.post_office ?? undefined,
      postal_code: first.postal_code ?? undefined,
      source_type: first.source_type ?? undefined,
    },
  });
}

const UpdateLocationBody = z.object({
  name: z.string().trim().min(1),
  longitude: z.number().finite(),
  latitude: z.number().finite(),
  address: OptionalLocationString,
  postal_code: OptionalLocationString,
  post_office: OptionalLocationString,
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

  const { name, longitude, latitude, address, postal_code, post_office, fieldValues } = parsed.data;

  const updated = await db.raw(
    `
      UPDATE recycler.locations l
      SET
        name = ?,
        geom = ST_SetSRID(ST_Point(?, ?), 4326),
        address = ?,
        postal_code = ?,
        post_office = ?
      FROM recycler.use_cases uc
      WHERE l.use_case_id = uc.id
        AND uc.organization_id = ?::uuid
        AND uc.id = ?::uuid
        AND l.id = ?::uuid
      RETURNING l.id;
    `,
    [
      name,
      longitude,
      latitude,
      address || null,
      postal_code || null,
      post_office || null,
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
