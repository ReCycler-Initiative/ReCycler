import db from "@/services/db";
import { DbLocation, LocationGeoJson } from "@/types";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetLocationsRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetLocationRequest = z.infer<typeof GetLocationsRequest>;

const LocationDtos = z.array(LocationGeoJson);

export async function GET(
  _: Request,
  { params }: { params: TGetLocationRequest }
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

    const locationDTOs = z
      .array(DbLocation)
      .transform((rows) => {
        return rows.reduce(
          (acc, row) => {
            let existing = acc.find((l) => l.properties.id === row.location_id);

            if (!existing) {
              existing = {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [100, 100],
                },
                properties: {
                  id: row.location_id,
                  name: row.location_name,
                  fields: [],
                },
              };

              acc.push(existing);
            }

            existing.properties.fields.push({
              name: row.field_name,
              type: row.field_type,
              value: row.field_values,
            });

            return acc;
          },
          [] as z.infer<typeof LocationDtos>
        );
      })
      .parse(result.rows);

    return NextResponse.json(locationDTOs);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
