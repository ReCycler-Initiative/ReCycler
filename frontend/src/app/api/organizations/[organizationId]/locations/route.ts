import db from "@/services/db";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetLocationsRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetLocationRequest = z.infer<typeof GetLocationsRequest>;

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

    return NextResponse.json(result.rows);
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
