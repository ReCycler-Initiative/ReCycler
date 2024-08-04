import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("recycler.materials", function (table) {
    table.renameColumn("material_name", "name");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("recycler.materials", function (table) {
    table.renameColumn("name", "material_name");
  });
}
