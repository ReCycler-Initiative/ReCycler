import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable("fields", (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
    table.uuid("organization_id").notNullable();
    table.string("name").notNullable();
    table.string("data_type").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    table
      .foreign("organization_id")
      .references("id")
      .inTable("recycler.organizations")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("fields");
}
