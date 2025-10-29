import { auth0, managementClient } from "@/lib/auth0";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations from Auth0
    const auth0Organizations = await managementClient.users.organizations.list(
      session.user.sub
    );

    if (!auth0Organizations.data || auth0Organizations.data.length === 0) {
      return NextResponse.json([]);
    }

    // Get the auth0_ids from the response
    const auth0Ids = auth0Organizations.data
      .map((org) => org.id)
      .filter((id): id is string => id !== undefined);

    // Fetch corresponding organizations from database
    const dbOrganizations = await db("recycler.organizations")
      .select("*")
      .whereIn("auth0_id", auth0Ids);

    // Merge Auth0 data (name) with database data
    const organizations = dbOrganizations.map((dbOrg) => {
      const auth0Org = auth0Organizations.data.find(
        (a0Org) => a0Org.id === dbOrg.auth0_id
      );
      return {
        ...dbOrg,
        name: auth0Org?.display_name || auth0Org?.name,
      };
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching user organizations:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
