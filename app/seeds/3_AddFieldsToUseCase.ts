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
        choiceColors: {
          "Ajoneuvoakut (lyijy)": "#d9001e",
          "Biojäte": "#139339",
          "Energiajäte": "#000000",
          "Kannettavat akut ja paristot": "#d9001e",
          "Kartonki": "#176eb1",
          "Kyllästetty puu": "#d9001e",
          "Lamput": "#d9001e",
          "Lasi": "#21a07b",
          "Metalli": "#485b66",
          "Muu jäte": "#000000",
          "Muovi": "#820f71",
          "Pahvi": "#176eb1",
          "Paperi": "#176eb1",
          "Poistotekstiili": "#6b9030",
          "Puu": "#d9001e",
          "Puutarhajäte": "#139339",
          "Rakennus- ja purkujäte": "#0c3a6f",
          "Sähkölaitteet (SER)": "#d9001e",
          "Sekajäte": "#000000",
          "Tekstiili": "#6b9030",
          "Vaarallinen jäte": "#d9001e",
        },
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
