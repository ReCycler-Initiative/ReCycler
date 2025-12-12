import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").alterTable("connectors", (table) => {
        table.dropForeign("organization_id");
        table.dropColumn("organization_id");
        table.uuid("use_case_id").notNullable().references("id").inTable("recycler.use_cases").onDelete("CASCADE");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").alterTable("connectors", (table) => {
        table.dropForeign("use_case_id");
        table.dropColumn("use_case_id");
        table.uuid("organization_id").notNullable().references("id").inTable("recycler.organizations").onDelete("CASCADE");
    });
}

