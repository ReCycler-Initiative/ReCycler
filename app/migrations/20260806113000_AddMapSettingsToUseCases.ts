import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.jsonb("map_settings").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.dropColumn("map_settings");
  });
}
