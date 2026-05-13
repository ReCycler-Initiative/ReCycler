import type { Knex } from "knex";

/**
 * Extend recycler.datasources with all fields needed to configure and run
 * an external REST/GeoJSON API data source:
 *  - status, source_format, auth config (encrypted), data path
 *  - coordinate mapping config (lat/lon or GeoJSON)
 *  - location name + external ID source fields
 *  - cron schedule for future automated runs
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
      ADD COLUMN status VARCHAR NOT NULL DEFAULT 'draft',
      ADD COLUMN source_format VARCHAR NOT NULL DEFAULT 'json',
      ADD COLUMN auth_type VARCHAR NOT NULL DEFAULT 'none',
      ADD COLUMN auth_header VARCHAR,
      ADD COLUMN auth_credentials_ciphertext TEXT,
      ADD COLUMN auth_credentials_last4 VARCHAR(4),
      ADD COLUMN data_path TEXT,
      ADD COLUMN name_source_field TEXT,
      ADD COLUMN external_id_source_field TEXT,
      ADD COLUMN coordinate_type VARCHAR NOT NULL DEFAULT 'latlon',
      ADD COLUMN lat_source_field TEXT,
      ADD COLUMN lon_source_field TEXT,
      ADD COLUMN geometry_source_field TEXT,
      ADD COLUMN schedule TEXT
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS source_format,
      DROP COLUMN IF EXISTS auth_type,
      DROP COLUMN IF EXISTS auth_header,
      DROP COLUMN IF EXISTS auth_credentials_ciphertext,
      DROP COLUMN IF EXISTS auth_credentials_last4,
      DROP COLUMN IF EXISTS data_path,
      DROP COLUMN IF EXISTS name_source_field,
      DROP COLUMN IF EXISTS external_id_source_field,
      DROP COLUMN IF EXISTS coordinate_type,
      DROP COLUMN IF EXISTS lat_source_field,
      DROP COLUMN IF EXISTS lon_source_field,
      DROP COLUMN IF EXISTS geometry_source_field,
      DROP COLUMN IF EXISTS schedule
  `);
}
