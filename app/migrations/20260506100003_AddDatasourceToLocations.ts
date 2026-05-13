import type { Knex } from "knex";

/**
 * Extend recycler.locations to support datasource-driven upserts:
 *  - external_id: the identifier from the source system
 *  - datasource_id: which datasource created/owns the location
 *  - UNIQUE (datasource_id, external_id): enables idempotent upsert on successive syncs
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.locations
      ADD COLUMN external_id VARCHAR,
      ADD COLUMN datasource_id UUID REFERENCES recycler.datasources(id) ON DELETE SET NULL
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX locations_datasource_external_id_unique
    ON recycler.locations (datasource_id, external_id)
    WHERE datasource_id IS NOT NULL AND external_id IS NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP INDEX IF EXISTS recycler.locations_datasource_external_id_unique`
  );
  await knex.raw(`
    ALTER TABLE recycler.locations
      DROP COLUMN IF EXISTS external_id,
      DROP COLUMN IF EXISTS datasource_id
  `);
}
