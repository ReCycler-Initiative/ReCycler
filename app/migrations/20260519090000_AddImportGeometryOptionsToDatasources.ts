import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
      ADD COLUMN import_point_geometries BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN import_non_point_geometries BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN generate_point_from_non_point_geometries BOOLEAN NOT NULL DEFAULT true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.datasources
      DROP COLUMN IF EXISTS import_point_geometries,
      DROP COLUMN IF EXISTS import_non_point_geometries,
      DROP COLUMN IF EXISTS generate_point_from_non_point_geometries
  `);
}