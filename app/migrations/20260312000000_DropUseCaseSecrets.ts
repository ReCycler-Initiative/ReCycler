import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("use_case_secrets");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").createTable("use_case_secrets", (table) => {
    table
      .uuid("use_case_id")
      .primary()
      .references("id")
      .inTable("recycler.use_cases")
      .onDelete("CASCADE");

    table.text("openai_api_key_ciphertext").notNullable();
    table.text("openai_api_key_last4").notNullable();

    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}
