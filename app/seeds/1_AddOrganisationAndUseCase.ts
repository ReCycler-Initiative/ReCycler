import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Insert organization
    await knex.raw(`
        INSERT INTO recycler.organizations
        (id, description, created_at, updated_at, auth0_id)
        VALUES('dd10636b-7746-44a4-9ce3-ce05ea5fa19f'::uuid, NULL, '2025-10-29 13:07:07.107', '2025-10-29 13:07:07.107', 'org_ZLGRoOAeiicqVBlU')
        ON CONFLICT (id) DO NOTHING;
    `);

    // Insert use case
    await knex.raw(`
        INSERT INTO recycler.use_cases
        (id, description, organization_id, "name", created_at, updated_at, intro_cta, intro_skip, intro_text, filters_cta, filters_text, intro_title, filters_title)
        VALUES('88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f'::uuid, 'test', 'dd10636b-7746-44a4-9ce3-ce05ea5fa19f'::uuid, 'Recycler 4.0', '2025-11-20 20:13:06.937', '2025-12-19 08:29:33.114', 'test', 'test', 'test', 'test', 'test', 'test', 'test')
        ON CONFLICT (id) DO NOTHING;
    `);
};
