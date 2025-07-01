import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP FUNCTION IF EXISTS recycler.get_location(UUID);
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION recycler.get_locations(organization_uuid UUID)
    RETURNS TABLE (
      location_id UUID,
      location_name TEXT,
      location_geom GEOMETRY(Point, 4326),
      field_name TEXT,
      field_type TEXT,
      field_values JSON
    ) AS $$
    BEGIN
      RETURN QUERY
      WITH field_values AS (
        SELECT
          lf.location_id,
          f.name::TEXT AS field_name,
          f.field_type::TEXT AS field_type,
          JSON_AGG(lf.value) AS field_values
        FROM recycler.location_fields lf
        JOIN recycler.fields f ON lf.field_id = f.id
        GROUP BY lf.location_id, f.name, f.field_type
      )
      SELECT
        l.id AS location_id,
        l.name::TEXT AS location_name,
        l.geom AS location_geom,
        fv.field_name,
        fv.field_type,
        fv.field_values
      FROM recycler.locations l
      LEFT JOIN field_values fv ON l.id = fv.location_id
      WHERE l.organization_id = organization_uuid;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the function if rolling back
  await knex.raw(`
    DROP FUNCTION IF EXISTS recycler.get_locations(UUID);
  `);
}
