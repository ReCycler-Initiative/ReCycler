import type { Knex } from "knex";

/**
 * Create recycler.datasource_field_mappings table.
 * Maps a source field (dot-path) from the external API response
 * to a destination field in the use case's fields schema.
 * Replaces the legacy etl_mappings approach.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable(
    "datasource_field_mappings",
    (table) => {
      table
        .uuid("id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();
      table
        .uuid("datasource_id")
        .notNullable()
        .references("id")
        .inTable("recycler.datasources")
        .onDelete("CASCADE");
      table.text("source_field").notNullable();
      table
        .uuid("field_id")
        .notNullable()
        .references("id")
        .inTable("recycler.fields")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    }
  );

  await knex.raw(
    `CREATE INDEX idx_datasource_field_mappings_datasource_id
     ON recycler.datasource_field_mappings (datasource_id)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .dropTableIfExists("datasource_field_mappings");
}
