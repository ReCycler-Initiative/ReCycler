import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.materials", (table) => {
    table.text("contents");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.materials", (table) => {
    table.dropColumn("contents");
  });
}
