import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").alterTable("connectors", (table) => {
        table.uuid("organization_id").notNullable().references("id").inTable("recycler.organizations").onDelete("CASCADE");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").alterTable("connectors", (table) => {
        table.dropColumn("organization_id");
    });
}

