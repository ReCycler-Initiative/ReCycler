import knex from "@/services/db";
import { CreateOrganizationRequest } from "@/types";
import { withZodPost } from "@/utils/routes";
import { NextResponse } from "next/server";

export const POST = withZodPost(CreateOrganizationRequest, async (params) => {
  const { organization, fields, useCase } = params;

  knex.insert(organization);

  const result = await knex.transaction(async (trx) => {
    const [organizationRow] = await trx
      .insert(organization)
      .into("recycler.organizations")
      .returning("id");

    const [useCaseRow] = await trx
      .insert({
        ...useCase,
        organization_id: organizationRow.id,
      })
      .into("recycler.use_cases")
      .returning("id");

    await Promise.all(
      fields.map((field) =>
        trx
          .insert({
            ...field,
            organization_id: organizationRow.id,
          })
          .into("recycler.fields")
      )
    );

    return {
      ...params,
      organization: {
        ...organization,
        id: organizationRow.id,
      },
      useCase: {
        ...useCase,
        id: useCaseRow.id,
      },
    };
  });

  return NextResponse.json(result);
});
