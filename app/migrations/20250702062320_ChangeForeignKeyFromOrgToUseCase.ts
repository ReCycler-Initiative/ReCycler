import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD COLUMN use_case_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.fields f
    SET use_case_id = uc.id
    FROM recycler.use_cases uc
    WHERE uc.organization_id = f.organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP CONSTRAINT IF EXISTS fields_organization_id_foreign;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP CONSTRAINT IF EXISTS unique_field_name_per_org;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP COLUMN IF EXISTS organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD CONSTRAINT fields_use_case_id_foreign
    FOREIGN KEY (use_case_id)
    REFERENCES recycler.use_cases(id)
    ON DELETE CASCADE;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD CONSTRAINT unique_field_name_per_use_case
    UNIQUE (use_case_id, name);
  `);

  await knex.raw(`
    ALTER TABLE recycler.locations
    ADD COLUMN use_case_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.locations l
    SET use_case_id = uc.id
    FROM recycler.use_cases uc
    WHERE uc.organization_id = l.organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    DROP CONSTRAINT IF EXISTS locations_organization_id_foreign;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    DROP COLUMN IF EXISTS organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    ADD CONSTRAINT locations_use_case_id_foreign
    FOREIGN KEY (use_case_id)
    REFERENCES recycler.use_cases(id)
    ON DELETE CASCADE;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etls
    ADD COLUMN use_case_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.etls e
    SET use_case_id = uc.id
    FROM recycler.use_cases uc
    WHERE uc.organization_id = e.organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ALTER COLUMN use_case_id SET NOT NULL;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    DROP CONSTRAINT IF EXISTS etls_organization_id_fkey;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    DROP CONSTRAINT IF EXISTS unique_etl_per_organization;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    DROP COLUMN IF EXISTS organization_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ADD CONSTRAINT etls_use_case_id_fkey
    FOREIGN KEY (use_case_id)
    REFERENCES recycler.use_cases(id)
    ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP CONSTRAINT IF EXISTS fields_use_case_id_foreign;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP CONSTRAINT IF EXISTS unique_field_name_per_use_case;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD COLUMN organization_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.fields f
    SET organization_id = uc.organization_id
    FROM recycler.use_cases uc
    WHERE f.use_case_id = uc.id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ALTER COLUMN organization_id SET NOT NULL;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    DROP COLUMN IF EXISTS use_case_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD CONSTRAINT fields_organization_id_foreign
    FOREIGN KEY (organization_id)
    REFERENCES recycler.organizations(id)
    ON DELETE CASCADE;
  `);
  await knex.raw(`
    ALTER TABLE recycler.fields
    ADD CONSTRAINT unique_field_name_per_org
    UNIQUE (organization_id, name);
  `);

  await knex.raw(`
    ALTER TABLE recycler.locations
    DROP CONSTRAINT IF EXISTS locations_use_case_id_foreign;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    ADD COLUMN organization_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.locations l
    SET organization_id = uc.organization_id
    FROM recycler.use_cases uc
    WHERE l.use_case_id = uc.id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    ALTER COLUMN organization_id SET NOT NULL;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    DROP COLUMN IF EXISTS use_case_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.locations
    ADD CONSTRAINT locations_organization_id_foreign
    FOREIGN KEY (organization_id)
    REFERENCES recycler.organizations(id)
    ON DELETE CASCADE;
  `);

  await knex.raw(`
    ALTER TABLE recycler.etls
    DROP CONSTRAINT IF EXISTS etls_use_case_id_fkey;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ADD COLUMN organization_id UUID;
  `);
  await knex.raw(`
    UPDATE recycler.etls e
    SET organization_id = uc.organization_id
    FROM recycler.use_cases uc
    WHERE e.use_case_id = uc.id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ALTER COLUMN organization_id SET NOT NULL;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    DROP COLUMN IF EXISTS use_case_id;
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ADD CONSTRAINT etls_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES recycler.organizations(id);
  `);
  await knex.raw(`
    ALTER TABLE recycler.etls
    ADD CONSTRAINT unique_etl_per_organization
    UNIQUE (organization_id);
  `);
}
