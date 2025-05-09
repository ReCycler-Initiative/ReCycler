import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP FUNCTION IF EXISTS recycler.get_locations(UUID);
      `);

  await knex.raw(`
        CREATE OR REPLACE FUNCTION recycler.get_locations(organization_uuid UUID)
        RETURNS TABLE (
          location_id UUID,
          location_name TEXT,
          location_geom JSONB,
          field_name TEXT,
          field_type TEXT,
          field_values JSON,
          field_order INT,
          field_data_type TEXT
        ) AS $$
        BEGIN
          RETURN QUERY
          WITH field_values AS (
            SELECT
              lf.location_id,
              f.name::TEXT AS field_name,
              f.field_type::TEXT AS field_type,
              JSON_AGG(lf.value) AS field_values,
              f.order AS field_order,
              f.data_type::TEXT AS field_data_type
            FROM recycler.location_fields lf
            JOIN recycler.fields f ON lf.field_id = f.id
            GROUP BY lf.location_id, f.name, f.field_type, field_order, field_data_type
            ORDER BY field_order
          )
          SELECT
            l.id AS location_id,
            l.name::TEXT AS location_name,
            ST_AsGeoJSON(l.geom)::jsonb AS location_geom,
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

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP FUNCTION IF EXISTS recycler.get_locations(UUID);
      `);

  await knex.raw(`
        CREATE OR REPLACE FUNCTION recycler.get_locations(organization_uuid UUID)
        RETURNS TABLE (
          location_id UUID,
          location_name TEXT,
          location_geom GEOMETRY(Point, 4326),
          field_name TEXT,
          field_type TEXT,
          field_values JSON,
          field_order INT,
          field_data_type TEXT
        ) AS $$
        BEGIN
          RETURN QUERY
          WITH field_values AS (
            SELECT
              lf.location_id,
              f.name::TEXT AS field_name,
              f.field_type::TEXT AS field_type,
              JSON_AGG(lf.value) AS field_values,
              f.order AS field_order,
              f.data_type::TEXT AS field_data_type
            FROM recycler.location_fields lf
            JOIN recycler.fields f ON lf.field_id = f.id
            GROUP BY lf.location_id, f.name, f.field_type, field_order, field_data_type
            ORDER BY field_order
          )
          SELECT
            l.id AS location_id,
            l.name::TEXT AS location_name,
            l.geom AS location_geom,
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
