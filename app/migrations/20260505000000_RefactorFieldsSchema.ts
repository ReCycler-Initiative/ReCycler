import type { Knex } from "knex";

/**
 * Refactor fields schema:
 * 1. Remove legacy Materials field (demo data)
 * 2. Standardize options JSONB: plain arrays → { choices: [...] }
 * 3. Refactor location_fields: multiple TEXT rows per field → single JSONB array row
 * 4. Drop redundant data_type column (derivable from field_type)
 * 5. Replace get_locations(organization_uuid) and get_location_fields(organization_uuid, location_uuid)
 *    with versions that take use_case_uuid (organization_id was removed in 20250702062320)
 */
export async function up(knex: Knex): Promise<void> {
  // 1. Remove Materials field — cascades to location_fields
  await knex.raw(`DELETE FROM recycler.fields WHERE name = 'Materials'`);

  // 2. Standardize options: plain JSON arrays → { choices: [...] }
  await knex.raw(`
    UPDATE recycler.fields
    SET options = jsonb_build_object('choices', options)
    WHERE options IS NOT NULL AND jsonb_typeof(options) = 'array'
  `);

  // 3. Refactor location_fields: collapse multiple TEXT value rows into one JSONB array row per field
  await knex.raw(`
    CREATE TEMP TABLE _lf_agg AS
    SELECT
      location_id,
      field_id,
      to_jsonb(array_agg(value ORDER BY value)) AS value_arr
    FROM recycler.location_fields
    GROUP BY location_id, field_id
  `);

  await knex.raw(`DELETE FROM recycler.location_fields`);

  // Column is now empty — safe to change type without data conversion
  await knex.raw(`
    ALTER TABLE recycler.location_fields
    ALTER COLUMN value TYPE JSONB USING value::jsonb
  `);

  await knex.raw(`
    INSERT INTO recycler.location_fields (id, location_id, field_id, value)
    SELECT uuid_generate_v4(), location_id, field_id, value_arr
    FROM _lf_agg
  `);

  await knex.raw(`
    ALTER TABLE recycler.location_fields
    ADD CONSTRAINT location_fields_location_field_unique UNIQUE (location_id, field_id)
  `);

  // 4. Drop redundant data_type column
  await knex.raw(
    `ALTER TABLE recycler.fields DROP COLUMN IF EXISTS data_type`
  );

  // 5. Drop old functions that reference the removed organization_id column
  await knex.raw(`DROP FUNCTION IF EXISTS recycler.get_locations(UUID)`);
  await knex.raw(
    `DROP FUNCTION IF EXISTS recycler.get_location_fields(UUID, UUID)`
  );

  // 6. New get_locations(use_case_uuid)
  await knex.raw(`
    CREATE FUNCTION recycler.get_locations(use_case_uuid UUID)
    RETURNS TABLE (
      location_id    UUID,
      location_name  TEXT,
      location_geom  JSONB,
      field_id       UUID,
      field_name     TEXT,
      field_type     TEXT,
      field_values   JSONB,
      field_order    INT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        l.id                          AS location_id,
        l.name::TEXT                  AS location_name,
        ST_AsGeoJSON(l.geom)::jsonb   AS location_geom,
        f.id                          AS field_id,
        f.name::TEXT                  AS field_name,
        f.field_type::TEXT            AS field_type,
        lf.value                      AS field_values,
        f.order                       AS field_order
      FROM recycler.locations l
      LEFT JOIN recycler.location_fields lf ON l.id = lf.location_id
      LEFT JOIN recycler.fields f ON lf.field_id = f.id
      WHERE l.use_case_id = use_case_uuid
      ORDER BY l.name, f.order;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 7. New get_location_fields(use_case_uuid, location_uuid)
  await knex.raw(`
    CREATE FUNCTION recycler.get_location_fields(use_case_uuid UUID, location_uuid UUID)
    RETURNS TABLE (
      location_id   UUID,
      field_id      UUID,
      field_name    TEXT,
      field_type    TEXT,
      field_values  JSONB,
      field_order   INT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        l.id            AS location_id,
        f.id            AS field_id,
        f.name::TEXT    AS field_name,
        f.field_type::TEXT AS field_type,
        lf.value        AS field_values,
        f.order         AS field_order
      FROM recycler.locations l
      LEFT JOIN recycler.location_fields lf ON l.id = lf.location_id
      LEFT JOIN recycler.fields f ON lf.field_id = f.id
      WHERE l.use_case_id = use_case_uuid AND l.id = location_uuid
      ORDER BY f.order;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop new functions
  await knex.raw(`DROP FUNCTION IF EXISTS recycler.get_locations(UUID)`);
  await knex.raw(
    `DROP FUNCTION IF EXISTS recycler.get_location_fields(UUID, UUID)`
  );

  // Restore data_type column (nullable — existing rows will have NULL)
  await knex.raw(
    `ALTER TABLE recycler.fields ADD COLUMN IF NOT EXISTS data_type TEXT`
  );

  // Revert location_fields: JSONB arrays → individual TEXT rows
  await knex.raw(`
    CREATE TEMP TABLE _lf_restore AS
    SELECT
      location_id,
      field_id,
      jsonb_array_elements_text(value) AS value
    FROM recycler.location_fields
  `);

  await knex.raw(`DELETE FROM recycler.location_fields`);

  await knex.raw(`
    ALTER TABLE recycler.location_fields
    DROP CONSTRAINT IF EXISTS location_fields_location_field_unique
  `);

  // Column is empty — safe to change type
  await knex.raw(`
    ALTER TABLE recycler.location_fields
    ALTER COLUMN value TYPE TEXT USING value::text
  `);

  await knex.raw(`
    INSERT INTO recycler.location_fields (id, location_id, field_id, value)
    SELECT uuid_generate_v4(), location_id, field_id, value
    FROM _lf_restore
  `);

  // Revert options: { choices: [...] } → plain array
  await knex.raw(`
    UPDATE recycler.fields
    SET options = options->'choices'
    WHERE options IS NOT NULL AND options ? 'choices'
  `);

  // Restore last known version of get_locations(organization_uuid)
  await knex.raw(`
    CREATE FUNCTION recycler.get_locations(organization_uuid UUID)
    RETURNS TABLE (
      location_id      UUID,
      location_name    TEXT,
      location_geom    JSONB,
      field_name       TEXT,
      field_type       TEXT,
      field_values     JSON,
      field_order      INT,
      field_data_type  TEXT
    ) AS $$
    BEGIN
      RETURN QUERY
      WITH field_values AS (
        SELECT
          lf.location_id,
          f.name::TEXT            AS field_name,
          f.field_type::TEXT      AS field_type,
          JSON_AGG(lf.value)      AS field_values,
          f.order                 AS field_order,
          f.data_type::TEXT       AS field_data_type
        FROM recycler.location_fields lf
        JOIN recycler.fields f ON lf.field_id = f.id
        GROUP BY lf.location_id, f.name, f.field_type, f.order, f.data_type
        ORDER BY f.order
      )
      SELECT
        l.id                          AS location_id,
        l.name::TEXT                  AS location_name,
        ST_AsGeoJSON(l.geom)::jsonb   AS location_geom,
        fv.field_name,
        fv.field_type,
        fv.field_values,
        fv.field_order,
        fv.field_data_type
      FROM recycler.locations l
      LEFT JOIN field_values fv ON l.id = fv.location_id
      WHERE l.organization_id = organization_uuid;
    END;
    $$ LANGUAGE plpgsql;
  `);
}
