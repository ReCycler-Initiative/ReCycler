import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable("objects", (table) => {
    table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
    table.string("name");
    table.uuid("use_case_id").notNullable();

    table
      .foreign("use_case_id")
      .references("id")
      .inTable("recycler.use_cases")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("objects");
}
