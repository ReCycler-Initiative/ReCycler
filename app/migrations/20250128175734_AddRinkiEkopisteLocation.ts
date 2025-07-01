import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const recyclerOrganization = await knex("recycler.organizations")
    .where("name", "Recycler")
    .select("id")
    .first();

  if (recyclerOrganization) {
    const locationId = knex.raw("uuid_generate_v4()");
    await knex("recycler.locations").insert({
      id: locationId,
      name: "Rinki Ekopiste",
      organization_id: recyclerOrganization.id,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  } else {
    throw new Error("Recycler organization not found.");
  }
}

export async function down(knex: Knex): Promise<void> {
  const location = await knex("recycler.locations")
    .where("name", "Rinki Ekopiste")
    .first();

  if (location) {
    await knex("recycler.locations").where("id", location.id).delete();
  } else {
    throw new Error("Location not found.");
  }
}
