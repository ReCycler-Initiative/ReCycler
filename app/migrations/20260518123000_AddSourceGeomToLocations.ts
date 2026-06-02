import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.locations", (table) => {
    table.specificType("source_geom", "geometry(Geometry, 4326)").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.locations", (table) => {
    table.dropColumn("source_geom");
  });
}