import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS ai CASCADE;`);

  await knex.raw(`
    SELECT ai.create_vectorizer(
        'recycler.materials'::regclass,
        destination => 'materials_embeddings',
        embedding => ai.embedding_ollama('all-minilm', 384),
        chunking => ai.chunking_recursive_character_text_splitter('contents')
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    select ai.drop_vectorizer((select id from ai.vectorizer_status vs where vs.source_table = 'recycler.materials'));
  `);

  await knex.raw(`
    DROP TABLE IF EXISTS recycler.materials_embeddings_store CASCADE;
  `);

  return knex.raw(`
    DROP EXTENSION IF EXISTS ai;
  `);
}
