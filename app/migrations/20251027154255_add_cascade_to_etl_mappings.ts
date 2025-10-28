import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    DROP CONSTRAINT IF EXISTS etl_mappings_etl_id_fkey;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    ADD CONSTRAINT etl_mappings_etl_id_fkey
    FOREIGN KEY (etl_id)
    REFERENCES recycler.etls(id)
    ON DELETE CASCADE;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    DROP CONSTRAINT IF EXISTS etl_mappings_destination_field_fkey;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    ADD CONSTRAINT etl_mappings_destination_field_fkey
    FOREIGN KEY (destination_field)
    REFERENCES recycler.fields(id)
    ON DELETE CASCADE;
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    DROP CONSTRAINT IF EXISTS etl_mappings_etl_id_fkey;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    ADD CONSTRAINT etl_mappings_etl_id_fkey
    FOREIGN KEY (etl_id)
    REFERENCES recycler.etls(id);
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    DROP CONSTRAINT IF EXISTS etl_mappings_destination_field_fkey;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings
    ADD CONSTRAINT etl_mappings_destination_field_fkey
    FOREIGN KEY (destination_field)
    REFERENCES recycler.fields(id);
  `);
}

