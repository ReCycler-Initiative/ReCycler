import db from "@/services/db";
import { DbLocation, LocationGeoJsonCollection } from "@/types";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetLocationsRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetLocationRequest = z.infer<typeof GetLocationsRequest>;

export async function GET(
  _: Request,
  { params }: { params: Promise<TGetLocationRequest> }
) {
  try {
    const { organizationId } = GetLocationsRequest.parse(await params);

    if (!organizationId) {
      return NextResponse.json(
        { error: "organisation_id is required" },
        { status: 400 }
      );
    }

    const result = await db.raw(`SELECT * FROM recycler.get_locations(?);`, [
      organizationId,
    ]);

    const locations = z
      .array(DbLocation)
      .transform((rows) => {
        return rows.reduce(
          (acc, row) => {
            let existing = acc.find((l) => l.properties.id === row.location_id);

            if (!existing) {
              existing = {
                type: "Feature",
                geometry: row.location_geom,
                properties: {
                  id: row.location_id,
                  name: row.location_name,
                  fields: [],
                },
              };

              acc.push(existing);
            }

            existing.properties.fields.push({
              data_type: row.field_data_type,
              name: row.field_name,
              field_type: row.field_type,
              order: row.field_order,
              value: row.field_values,
            });

            return acc;
          },
          [] as z.infer<typeof LocationGeoJsonCollection>["features"]
        );
      })
      .parse(result.rows);

    return NextResponse.json({
      type: "FeatureCollection",
      features: locations,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
