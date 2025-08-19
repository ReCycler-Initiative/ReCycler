import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.string("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.dropColumn("name");
  });
}
