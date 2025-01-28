import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE OR REPLACE FUNCTION recycler.get_location(location_uuid UUID)
            RETURNS TABLE (
            location_id UUID,
            field_name TEXT,
            field_type TEXT,
            field_values JSON
            ) AS $$
            BEGIN
            RETURN QUERY
            WITH field_values AS (
                SELECT
                lf.location_id,
                f.name::TEXT AS field_name, -- Explicitly cast to TEXT
                f.field_type::TEXT AS field_type, -- Explicitly cast to TEXT
                JSON_AGG(lf.value) AS field_values -- Use JSON_AGG to handle mixed types
                FROM location_fields lf
                JOIN fields f ON lf.field_id = f.id
                GROUP BY lf.location_id, f.name, f.field_type
            )
            SELECT
                fv.location_id,
                fv.field_name,
                fv.field_type,
                fv.field_values
            FROM field_values fv
            WHERE fv.location_id = location_uuid;
            END;
            $$ LANGUAGE plpgsql;
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP FUNCTION IF EXISTS recycler.get_location(UUID);
    `);
}
