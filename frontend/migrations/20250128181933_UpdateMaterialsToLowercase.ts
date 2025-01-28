import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const materialsField = await knex("fields")
    .withSchema("recycler")
    .where("name", "Materials")
    .select("id")
    .first();

  await knex("fields")
    .withSchema("recycler")
    .where("id", materialsField.id)
    .update({
      name: "materials",
    });
}

export async function down(knex: Knex): Promise<void> {
  const materialsField = await knex("fields")
    .withSchema("recycler")
    .where("name", "materials")
    .select("id")
    .first();

  await knex("fields")
    .withSchema("recycler")
    .where("id", materialsField.id)
    .update({
      name: "Materials",
    });
}
