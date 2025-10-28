import { auth0, managementClient } from "@/lib/auth0";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";

export interface AuthorizationResult {
  authorized: boolean;
  response?: NextResponse;
  session?: any;
  organization?: any;
}

/**
 * Check if the authenticated user has access to the specified organization
 * @param request - The Next.js request object
 * @param organizationId - The organization ID (database UUID)
 * @returns Authorization result with response if unauthorized
 */
export async function checkOrganizationAuthorization(
  request: NextRequest,
  organizationId: string
): Promise<AuthorizationResult> {
  // Check authentication
  const session = await auth0.getSession(request);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Fetch organization from database
  const dbOrganization = await db
    .select("*")
    .from("recycler.organizations")
    .where("id", organizationId)
    .first();

  if (!dbOrganization) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      ),
    };
  }

  if (!dbOrganization.auth0_id) {
    console.error("Organization missing auth0_id:", organizationId);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Organization not properly configured" },
        { status: 500 }
      ),
    };
  }

  // Check if user is a member of the organization
  try {
    const membersResponse = await managementClient.organizations.members.list(
      dbOrganization.auth0_id
    );

    const isMember = membersResponse.data.some(
      (member) => member.user_id === session.user.sub
    );

    if (!isMember) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden: You are not a member of this organization" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      session,
      organization: dbOrganization,
    };
  } catch (error) {
    console.error("Error checking organization membership:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Failed to verify organization access" },
        { status: 500 }
      ),
    };
  }
}
