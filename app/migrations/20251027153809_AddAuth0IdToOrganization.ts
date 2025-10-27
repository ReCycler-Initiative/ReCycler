import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('recycler').alterTable("organizations", (table) => {
        table.string("auth0_id").nullable().unique();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('recycler').alterTable("organizations", (table) => {
        table.dropColumn("auth0_id");
    });
}

