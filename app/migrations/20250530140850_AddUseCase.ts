import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS recycler.use_cases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      description TEXT,
      organization_id UUID NOT NULL,
      CONSTRAINT fk_organization
        FOREIGN KEY (organization_id)
        REFERENCES recycler.organizations(id)
        ON DELETE CASCADE
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS recycler.use_cases;
  `);
}
