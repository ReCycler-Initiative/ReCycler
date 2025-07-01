import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.locations", (table) => {
    table.specificType("geom", "geometry(Point, 4326)").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("recycler.locations", (table) => {
    table.dropColumn("geom");
  });
}
