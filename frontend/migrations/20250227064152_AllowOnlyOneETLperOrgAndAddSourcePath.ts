import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE recycler.etls 
      ADD COLUMN source_path TEXT NULL;
    `);

  await knex.raw(`
      ALTER TABLE recycler.etls 
      ADD CONSTRAINT unique_etl_per_organization UNIQUE (organization_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE recycler.etls 
      DROP CONSTRAINT IF EXISTS unique_etl_per_organization;
    `);

  await knex.raw(`
      ALTER TABLE recycler.etls 
      DROP COLUMN IF EXISTS source_path;
    `);
}
