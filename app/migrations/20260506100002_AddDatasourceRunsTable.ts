import type { Knex } from "knex";

/**
 * Create recycler.datasource_runs table.
 * Records each sync execution for audit, status tracking, and the runs page UI.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable(
    "datasource_runs",
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
      // running | completed | failed
      table.string("status", 20).notNullable();
      table.timestamp("started_at").notNullable();
      table.timestamp("finished_at").nullable();
      table.integer("rows_synced").nullable();
      table.integer("rows_failed").nullable();
      table.text("error_message").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    }
  );

  await knex.raw(
    `CREATE INDEX idx_datasource_runs_datasource_id
     ON recycler.datasource_runs (datasource_id)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .dropTableIfExists("datasource_runs");
}
