import { auth0, managementClient } from "@/lib/auth0";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetOrganizationRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetOrganizationRequest = z.infer<typeof GetOrganizationRequest>;

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<TGetOrganizationRequest> }
) {
  try {
    const { organizationId } = await params;
    const dbOrganization = await db
      .select("*")
      .from("recycler.organizations")
      .where("id", organizationId)
      .first();

    if (!dbOrganization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const auth0Organization = await managementClient.organizations.get(
      dbOrganization.auth0_id
    );

    return NextResponse.json({
      ...dbOrganization,
      name: auth0Organization.display_name || auth0Organization.name,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<TGetOrganizationRequest> }
) {
  try {
    const { organizationId } = await params;

    // Check authorization
    const authResult = await checkOrganizationAuthorization(
      request,
      organizationId
    );

    if (!authResult.authorized) {
      return authResult.response!;
    }

    const body = await request.json();

    await managementClient.organizations.update(
      authResult.organization!.auth0_id,
      {
        display_name: body.name,
      }
    );

    const updatedDbOrg = await db("recycler.organizations")
      .where("id", organizationId)
      .update({
        updated_at: new Date(),
      })
      .returning("*")
      .then((rows) => rows[0]);

    return NextResponse.json({
      ...updatedDbOrg,
      name: body.name,
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
