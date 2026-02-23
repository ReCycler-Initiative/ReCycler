import db from "@/services/db";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; locationId: string }> }
) {
  const { organizationId, locationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  const location = (
    await db.raw(
      `SELECT * FROM recycler.locations WHERE id = ? AND organization_id = ?;`,
      [locationId, organizationId]
    )
  ).rows[0];

  const fields = (
    await db.raw(`SELECT * FROM recycler.get_location_fields(?,?);`, [
      organizationId,
      locationId,
    ])
  ).rows;

  return NextResponse.json({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [24.9354, 60.1695],
    },
    properties: { ...location, fields },
  });
}
