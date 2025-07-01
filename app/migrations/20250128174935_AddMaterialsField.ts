import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const defaultMaterials = [
    "Ajoneuvoakut (lyijy)",
    "Biojäte",
    "Energiajäte",
    "Kannettavat akut ja paristot",
    "Kartonki",
    "Kyllästetty puu",
    "Lamput",
    "Lasi",
    "Metalli",
    "Muovi",
    "Muu jäte",
    "Pahvi",
    "Paperi",
    "Poistotekstiili",
    "Puu",
    "Puutarhajäte",
    "Rakennus- ja purkujäte",
    "Sähkölaitteet (SER)",
    "Sekajäte",
    "Tekstiili",
    "Vaarallinen jäte",
  ];

  const recyclerOrganization = await knex("recycler.organizations")
    .where("name", "Recycler")
    .select("id")
    .first();

  if (recyclerOrganization) {
    await knex("recycler.fields").insert({
      id: knex.raw("uuid_generate_v4()"),
      organization_id: recyclerOrganization.id,
      name: "Materials",
      data_type: "array",
      field_type: "select",
      options: JSON.stringify(defaultMaterials),
      required: true,
      created_at: knex.fn.now(),
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex("recycler.fields").where("name", "Materials").delete();
}
