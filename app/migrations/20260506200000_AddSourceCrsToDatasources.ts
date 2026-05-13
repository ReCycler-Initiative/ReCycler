import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
    ADD COLUMN IF NOT EXISTS source_crs VARCHAR(20) NOT NULL DEFAULT 'wgs84';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
    DROP COLUMN IF EXISTS source_crs;
  `);
}
