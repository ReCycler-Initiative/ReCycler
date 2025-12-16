import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.string("intro_cta");
    table.string("intro_skip");
    table.text("intro_text");
    table.string("filters_cta");
    table.text("filters_text");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.use_cases", (table) => {
    table.dropColumn("intro_cta");
    table.dropColumn("intro_skip");
    table.dropColumn("intro_text");
    table.dropColumn("filters_cta");
    table.dropColumn("filters_text");
  });
}

