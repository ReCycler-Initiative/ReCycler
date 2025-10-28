import { auth0, managementClient } from "@/lib/auth0";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetOrganizationAccessRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetOrganizationAccessRequest = z.infer<
  typeof GetOrganizationAccessRequest
>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<TGetOrganizationAccessRequest> }
) {
  try {
    const session = await auth0.getSession(request);

    if (!session) {
      return NextResponse.json({ hasAccess: false }, { status: 401 });
    }

    const { organizationId } = await params;
    const dbOrganization = await db
      .select("*")
      .from("recycler.organizations")
      .where("id", organizationId)
      .first();

    if (!dbOrganization) {
      return NextResponse.json({ hasAccess: false }, { status: 404 });
    }

    if (!dbOrganization.auth0_id) {
      console.error("Organization missing auth0_id:", organizationId);
      return NextResponse.json(
        { hasAccess: false, error: "Organization not properly configured" },
        { status: 500 }
      );
    }

    // Check if user is a member of the organization
    const membersResponse = await managementClient.organizations.members.list(
      dbOrganization.auth0_id
    );

    const isMember = membersResponse.data.some(
      (member) => member.user_id === session.user.sub
    );

    if (!isMember) {
      return NextResponse.json({ hasAccess: false }, { status: 403 });
    }

    return NextResponse.json({ hasAccess: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Organization access check error:", error);

    return NextResponse.json(
      { hasAccess: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
