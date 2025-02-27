import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        CREATE TABLE recycler.etls (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES recycler.organizations(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
  `);

  await knex.raw(`
    CREATE TABLE recycler.etl_mappings(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        etl_id UUID REFERENCES recycler.etls(id),
        source_field VARCHAR(255) NOT NULL,
        destination_field UUID NOT NULL REFERENCES recycler.fields(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("DROP TABLE recycler.etl_mappings;");

  await knex.raw(`
    DROP TABLE recycler.etls;
`);
}
