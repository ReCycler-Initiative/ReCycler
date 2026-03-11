import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.string("filters_tab_ai");
    table.string("filters_tab_manual");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.dropColumn("filters_tab_ai");
    table.dropColumn("filters_tab_manual");
  });
}
