import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('recycler').createTable("locations", (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
    table.string("name").notNullable();
    table.uuid("organization_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    // Foreign key constraint
    table
      .foreign("organization_id")
      .references("id")
      .inTable("recycler.organizations")
      .onDelete("CASCADE"); // If the organization is deleted, cascade delete locations
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('recycler').dropTableIfExists("locations");
}
