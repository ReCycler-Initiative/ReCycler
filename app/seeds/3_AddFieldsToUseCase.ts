import { Knex } from "knex";

const USE_CASE_ID = "88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f";

export async function seed(knex: Knex): Promise<void> {
  await knex("recycler.fields").where({ use_case_id: USE_CASE_ID }).delete();

  await knex("recycler.fields").insert([
    {
      id: knex.raw("uuid_generate_v4()"),
      use_case_id: USE_CASE_ID,
      name: "Materiaalit",
      field_type: "multi_select",
      options: JSON.stringify({
        choices: [
          "Ajoneuvoakut (lyijy)",
          "Biojäte",
          "Energiajäte",
          "Kannettavat akut ja paristot",
          "Kartonki",
          "Kyllästetty puu",
          "Lamput",
          "Lasi",
          "Metalli",
          "Muu jäte",
          "Muovi",
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
        ],
      }),
      required: true,
      order: 1,
      created_at: knex.fn.now(),
    },
    {
      id: knex.raw("uuid_generate_v4()"),
      use_case_id: USE_CASE_ID,
      name: "Aukioloajat",
      field_type: "text_input",
      options: JSON.stringify({
        placeholder: "esim. Ma–Pe 8–20, La 9–16",
        helpText: "Kirjoita aukioloajat vapaana tekstinä.",
      }),
      required: false,
      order: 2,
      created_at: knex.fn.now(),
    },
    {
      id: knex.raw("uuid_generate_v4()"),
      use_case_id: USE_CASE_ID,
      name: "Lisätiedot",
      field_type: "text_input",
      options: JSON.stringify({
        placeholder: "esim. Maksullinen palvelu, vaatii rekisteröitymisen",
      }),
      required: false,
      order: 3,
      created_at: knex.fn.now(),
    },
  ]);
}
