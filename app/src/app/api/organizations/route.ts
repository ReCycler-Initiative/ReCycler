import { auth0, managementClient } from "@/lib/auth0";
import knex from "@/services/db";
import { CreateOrganizationRequest, CreateOrganizationResponse } from "@/types";
import { withZodPost } from "@/utils/routes";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = withZodPost(
  CreateOrganizationRequest,
  async (params, req) => {
    const session = await auth0.getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const { organization, useCase } = params;

    const sanitizedOrgName = organization.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let auth0OrganizationId: string | undefined;

    try {
      const result = await knex.transaction(async (trx) => {
        const auth0Organization = await managementClient.organizations.create({
          name: sanitizedOrgName,
          display_name: organization.name,
        });

        auth0OrganizationId = auth0Organization.id;

        await managementClient.organizations.members.create(
          auth0Organization.id!,
          { members: [user.sub] }
        );

        const [organizationRow] = await trx
          .insert({ ...organization, auth0_id: auth0Organization.id })
          .into("recycler.organizations")
          .returning("id");

        const [useCaseRow] = await trx
          .insert({
            ...useCase,
            organization_id: organizationRow.id,
          })
          .into("recycler.use_cases")
          .returning("id");

        const response: z.infer<typeof CreateOrganizationResponse> = {
          organization: {
            ...organization,
            auth0_id: auth0OrganizationId!,
            id: organizationRow.id,
          },
          useCase: {
            ...useCase,
            id: useCaseRow.id,
          },
        };

        return response;
      });

      return NextResponse.json(result);
    } catch (error) {
      if (auth0OrganizationId) {
        try {
          await managementClient.organizations.delete(auth0OrganizationId);
        } catch (deleteError) {
          console.error("Failed to cleanup Auth0 organization:", deleteError);
        }
      }
      throw error;
    }
  }
);
