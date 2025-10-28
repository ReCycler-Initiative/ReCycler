import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('recycler').alterTable('organizations', (table) => {
    table.dropColumn('name');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('recycler').alterTable('organizations', (table) => {
    table.string('name').notNullable();
  });
}

