import knex from "@/services/db";
import { CreateOrganizationRequest } from "@/types";
import { withZodPost } from "@/utils/routes";
import { NextResponse } from "next/server";

export const POST = withZodPost(CreateOrganizationRequest, async (params) => {
  const { organization, fields } = params;

  knex.insert(organization);

  const result = await knex.transaction(async (trx) => {
    const [row] = await trx
      .insert(organization)
      .into("recycler.organizations")
      .returning("id");

    await Promise.all(
      fields.map((field) =>
        trx
          .insert({
            ...field,
            organization_id: row.id,
          })
          .into("recycler.fields")
      )
    );

    return {
      ...params,
      organization: {
        ...organization,
        id: row.id,
      },
    };
  });

  return NextResponse.json(result);
});
