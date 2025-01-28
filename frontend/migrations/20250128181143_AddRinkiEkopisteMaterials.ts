import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const rinkiLocation = await knex("recycler.locations")
    .where("name", "Rinki Ekopiste")
    .select("id")
    .first();

  if (rinkiLocation) {
    const materialsField = await knex("recycler.fields")
      .where("name", "Materials")
      .select("id")
      .first();

    if (materialsField) {
      const materials = [
        "Kartonki",
        "Lasi",
        "Metalli",
        "Muovi",
        "Paperi",
        "Tekstiili",
      ];

      for (const material of materials) {
        await knex("recycler.location_fields").insert({
          id: knex.raw("uuid_generate_v4()"),
          location_id: rinkiLocation.id,
          field_id: materialsField.id,
          value: material,
        });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const rinkiLocation = await knex("recycler.locations")
    .where("name", "Rinki Ekopiste")
    .select("id")
    .first();

  if (rinkiLocation) {
    await knex("recycler.location_fields")
      .where("location_id", rinkiLocation.id)
      .delete();
  }
}
