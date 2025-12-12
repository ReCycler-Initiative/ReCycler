import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").createTable("connectors", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name").notNullable();
        table.string("url").notNullable();
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").dropTable("connectors");
}

