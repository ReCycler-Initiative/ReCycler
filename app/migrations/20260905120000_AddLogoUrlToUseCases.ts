import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .table("use_cases", (table) => {
      table.text("logo_url").nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .table("use_cases", (table) => {
      table.dropColumn("logo_url");
    });
}