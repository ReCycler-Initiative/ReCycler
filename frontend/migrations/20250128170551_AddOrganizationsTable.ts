import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('recycler').createTable("organizations", (table) => {
        table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
        table.string("name").notNullable();
        table.text("description").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('recycler').dropTableIfExists("organizations");
}
