import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").renameTable("connectors", "datasources");
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema("recycler").renameTable("datasources", "connectors");
}

