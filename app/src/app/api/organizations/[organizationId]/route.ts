import db from "@/services/db";
import { DbLocation, LocationGeoJsonCollection } from "@/types";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetOrganizationRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetOrganizationRequest = z.infer<typeof GetOrganizationRequest>;

export async function GET(
  _: Request,
  { params }: { params: Promise<TGetOrganizationRequest> }
) {
  try {
    const { organizationId } = await params;
    const organization = await db
      .select("*")
      .from("recycler.organizations")
      .where("id", organizationId)
      .first();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
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
