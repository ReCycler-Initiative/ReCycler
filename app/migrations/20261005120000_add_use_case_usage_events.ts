import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable("usage_events", (table) => {
    table.bigIncrements("id").primary();
    table.uuid("use_case_id").notNullable().references("id").inTable("recycler.use_cases").onDelete("CASCADE");
    table.uuid("session_id").notNullable();
    table.string("event_type", 32).notNullable();
    table.jsonb("metadata").notNullable().defaultTo("{}");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(["use_case_id", "created_at"]);
    table.index(["use_case_id", "event_type", "created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("usage_events");
}