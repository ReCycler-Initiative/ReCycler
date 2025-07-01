import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.fields 
    ADD CONSTRAINT unique_field_name_per_org UNIQUE (organization_id, name);
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings 
    ADD COLUMN destination_table VARCHAR(255);
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings 
    DROP CONSTRAINT IF EXISTS etl_mappings_destination_field_fkey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.fields 
    DROP CONSTRAINT IF EXISTS unique_field_name_per_org;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings 
    DROP COLUMN IF EXISTS destination_table;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etl_mappings 
    ADD CONSTRAINT etl_mappings_destination_field_fkey 
    FOREIGN KEY (destination_field) REFERENCES recycler.fields(id);
  `);
}
