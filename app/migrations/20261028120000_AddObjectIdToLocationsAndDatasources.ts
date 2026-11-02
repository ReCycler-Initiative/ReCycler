import type { Knex } from "knex";

/**
 * Link locations and datasources directly to a location type (recycler.objects).
 *
 * Until now a location's type was inferred on every read as the type whose
 * fields hold most of its values. That inference is used once here to
 * backfill locations; datasources get the type whose fields they map the
 * most. Anything left without a match falls back to the use case's oldest
 * location type.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.locations
      ADD COLUMN object_id UUID REFERENCES recycler.objects(id) ON DELETE SET NULL;
    ALTER TABLE recycler.datasources
      ADD COLUMN object_id UUID REFERENCES recycler.objects(id) ON DELETE SET NULL;
    CREATE INDEX locations_object_id_idx ON recycler.locations (object_id);
  `);

  await knex.raw(`
    UPDATE recycler.locations l
    SET object_id = (
      SELECT o.id
      FROM recycler.objects o
      LEFT JOIN recycler.fields tf ON tf.object_id = o.id
      LEFT JOIN recycler.location_fields tlf
        ON tlf.field_id = tf.id AND tlf.location_id = l.id
      WHERE o.use_case_id = l.use_case_id
      GROUP BY o.id
      ORDER BY count(tlf.field_id) DESC, o.created_at NULLS LAST
      LIMIT 1
    );
  `);

  await knex.raw(`
    UPDATE recycler.datasources ds
    SET object_id = (
      SELECT o.id
      FROM recycler.objects o
      LEFT JOIN recycler.fields tf ON tf.object_id = o.id
      LEFT JOIN recycler.datasource_field_mappings m
        ON m.field_id = tf.id AND m.datasource_id = ds.id
      WHERE o.use_case_id = ds.use_case_id
      GROUP BY o.id
      ORDER BY count(m.field_id) DESC, o.created_at NULLS LAST
      LIMIT 1
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP INDEX IF EXISTS recycler.locations_object_id_idx;
    ALTER TABLE recycler.locations DROP COLUMN IF EXISTS object_id;
    ALTER TABLE recycler.datasources DROP COLUMN IF EXISTS object_id;
  `);
}
