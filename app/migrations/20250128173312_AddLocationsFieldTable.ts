import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .createTable("location_fields", (table) => {
      table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
      table.uuid("location_id").notNullable();
      table.uuid("field_id").notNullable();
      table.text("value").notNullable();

      table
        .foreign("location_id")
        .references("id")
        .inTable("recycler.locations")
        .onDelete("CASCADE");
      table
        .foreign("field_id")
        .references("id")
        .inTable("recycler.fields")
        .onDelete("CASCADE");
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("location_fields");
}
