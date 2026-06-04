import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").alterTable("datasource_runs", (table) => {
    table.integer("rows_deleted").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").alterTable("datasource_runs", (table) => {
    table.dropColumn("rows_deleted");
  });
}