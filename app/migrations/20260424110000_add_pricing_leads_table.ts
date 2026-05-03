import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable("pricing_leads", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.string("organization_name");
    table.string("phone");
    table.text("message");
    table.jsonb("chat_history").notNullable().defaultTo(knex.raw("'[]'::jsonb"));
    table.string("source").notNullable().defaultTo("pricing-chat");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTable("pricing_leads");
}
