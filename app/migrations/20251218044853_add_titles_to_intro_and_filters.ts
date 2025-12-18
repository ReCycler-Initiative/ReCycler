import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.string("intro_title");
    table.string("filters_title");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.dropColumn("intro_title");
    table.dropColumn("filters_title");
  });
}

