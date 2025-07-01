import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").alterTable("fields", (table) => {
    table.string("field_type").notNullable().defaultTo("text");
    table.jsonb("options").nullable();
    table.boolean("required").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").alterTable("fields", (table) => {
    table.dropColumn("field_type");
    table.dropColumn("options");
    table.dropColumn("required");
  });
}
