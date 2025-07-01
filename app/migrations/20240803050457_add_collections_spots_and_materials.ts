import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .withSchema("recycler")
    .createTable("collection_spots", (table) => {
      table.increments("id").primary();
      table.text("spot_id");
      table.text("name");
      table.text("address");
      table.text("postal_code");
      table.text("post_office");
      table.text("materials");
      table.text("municipality");
      table.specificType('geom', 'geometry(Point, 4326)');
      table.text("opening_hours_en");
      table.text("opening_hours_fi");
      table.text("opening_hours_sv");
      table.text("description_en");
      table.text("description_fi");
      table.text("description_sv");
      table.text("occupied");
      table.text("additional_details");
    })
    .createTable("materials", (table) => {
      table.increments("id").primary();
      table.integer("code").unique();
      table.text("material_name").unique();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .withSchema("recycler")
    .dropTableIfExists("collection_spots")
    .dropTableIfExists("materials");
}
