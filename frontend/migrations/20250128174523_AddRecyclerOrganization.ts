import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex("recycler.organizations").insert({
    id: knex.raw("uuid_generate_v4()"),
    name: "Recycler",
    description: "The default organization for managing recycling operations.",
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex("recycler.organizations").where("name", "Recycler").delete();
}
