import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema("recycler")
    .createTable("use_case_training_materials", (table) => {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));

      table
        .uuid("use_case_id")
        .notNullable()
        .references("id")
        .inTable("recycler.use_cases")
        .onDelete("CASCADE");

      table.text("filename").notNullable();
      table.text("mime_type").notNullable();
      table.text("content_text").notNullable();

      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index(["use_case_id"], "idx_use_case_training_materials_use_case_id");
    });

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

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").dropTableIfExists("use_case_secrets");
  await knex.schema
    .withSchema("recycler")
    .dropTableIfExists("use_case_training_materials");
}
