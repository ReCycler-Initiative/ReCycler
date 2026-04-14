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
    },
  });
}

const UpdateLocationBody = z.object({
  name: z.string().trim().min(1),
  longitude: z.number().finite(),
  latitude: z.number().finite(),
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

  const { name, longitude, latitude, fieldValues } = parsed.data;

  const updated = await db.raw(
    `
      UPDATE recycler.locations l
      SET name = ?, geom = ST_SetSRID(ST_Point(?, ?), 4326)
      FROM recycler.use_cases uc
      WHERE l.use_case_id = uc.id
        AND uc.organization_id = ?::uuid
        AND uc.id = ?::uuid
        AND l.id = ?::uuid
      RETURNING l.id;
    `,
    [name, longitude, latitude, organizationId, useCaseId, locationId]
  );

  if (!updated.rows?.[0]) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  if (fieldValues && fieldValues.length > 0) {
    await db.raw(
      `DELETE FROM recycler.location_fields WHERE location_id = ?::uuid`,
      [locationId]
    );

    const insertRows = fieldValues.flatMap(({ fieldId, values }) =>
      values.map((value) => ({ fieldId, value }))
    );

    if (insertRows.length > 0) {
      await db("recycler.location_fields").insert(
        insertRows.map(({ fieldId, value }) => ({
          id: db.raw("uuid_generate_v4()"),
          location_id: locationId,
          field_id: fieldId,
          value,
        }))
      );
    }
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
