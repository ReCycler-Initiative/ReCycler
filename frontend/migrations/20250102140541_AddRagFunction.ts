import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_rag_response(query_text TEXT)
        RETURNS TEXT AS $$
        DECLARE
        context_chunks TEXT;
        response TEXT;
        BEGIN

        SELECT string_agg(name || ': ' || chunk, E'\n') INTO context_chunks
        FROM
        (
            SELECT name, chunk
            FROM recycler.materials_embeddings
            ORDER BY embedding <=> ai.ollama_embed('all-minilm', query_text)
            LIMIT 3
        ) AS relevant_posts;

        SELECT ai.ollama_chat_complete
        ( 'hf.co/mradermacher/Ahma-7B-Instruct-GGUF:Q4_K_M'
        , jsonb_build_array
            ( jsonb_build_object('role', 'system', 'content', 'Olet ystävällinen kierrätysavustaja. Avustat käyttäjää kierrätykseen liittyvissä kysymyksissä.')
            , jsonb_build_object
            ('role', 'user'
            , 'content', query_text || E'\nKäytä seuraavaa sisältöä vastauksen apuna.\n' || context_chunks
            )
            )
        )->'message'->>'content' INTO response;

        RETURN response;
        END;
        $$ LANGUAGE plpgsql;
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP FUNCTION IF EXISTS generate_rag_response;
`);
}
