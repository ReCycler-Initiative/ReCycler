import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw("CREATE SCHEMA IF NOT EXISTS recycler");
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw("DROP SCHEMA IF EXISTS recycler CASCADE");
}
