import { Knex } from "knex";

const USE_CASE_ID = "88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f";

// Per-location field values: materials + opening hours + extra info
const LOCATION_DATA: Record<
  string,
  { materiaalit: string[]; aukioloajat: string; lisatiedot?: string }
> = {
  "Rinki-ekopiste Keskusta": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Tekstiili"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Kaleva": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Ma–Pe 7–21, La–Su 8–20",
  },
  "Rinki-ekopiste Hervanta": {
    materiaalit: ["Biojäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Pahvi"],
    aukioloajat: "Avoinna 24/7",
    lisatiedot: "Lähellä Hervantajärveä",
  },
  "Rinki-ekopiste Lielahti": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Sähkölaitteet (SER)"],
    aukioloajat: "Ma–Pe 8–20, La 9–17",
    lisatiedot: "Kauppakeskus Lielahdessa",
  },
  "Rinki-ekopiste Tesoma": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Linnainmaa": {
    materiaalit: ["Biojäte", "Energiajäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Ma–Su 7–22",
  },
  "Rinki-ekopiste Härmälä": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Puutarhajäte"],
    aukioloajat: "Avoinna 24/7",
    lisatiedot: "Puutarhajätepiste auki Apr–Oct",
  },
  "Rinki-ekopiste Peltolammi": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Ma–Pe 8–20, La–Su 9–18",
  },
  "Rinki-ekopiste Multisilta": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Tekstiili"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Kaukajärvi": {
    materiaalit: ["Biojäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Ma–Su 7–22",
  },
  "Rinki-ekopiste Messukylä": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Pahvi"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Nekala": {
    materiaalit: ["Energiajäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Ma–Pe 7–21, La–Su 9–19",
    lisatiedot: "Energiajätepiste uusittu 2025",
  },
  "Rinki-ekopiste Rahola": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Poistotekstiili"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Takahuhti": {
    materiaalit: ["Biojäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Pahvi"],
    aukioloajat: "Ma–Su 7–22",
  },
  "Rinki-ekopiste Atala": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Avoinna 24/7",
    lisatiedot: "Pysäköinti rajattu, max 30 min",
  },
  "Rinki-ekopiste Lamminpää": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Puutarhajäte"],
    aukioloajat: "Ma–Pe 8–20, La 9–16",
  },
  "Rinki-ekopiste Ikuri": {
    materiaalit: ["Biojäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi"],
    aukioloajat: "Avoinna 24/7",
  },
  "Rinki-ekopiste Olkahinen": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Tekstiili"],
    aukioloajat: "Ma–Su 8–21",
    lisatiedot: "Uusi pisteet avattu 2024",
  },
  "Rinki-ekopiste Vuores": {
    materiaalit: ["Biojäte", "Energiajäte", "Kartonki", "Lasi", "Metalli", "Muovi", "Paperi", "Pahvi"],
    aukioloajat: "Avoinna 24/7",
    lisatiedot: "Vuores on uusi alue, pisteet laajat",
  },
  "Rinki-ekopiste Kämmenniemi": {
    materiaalit: ["Kartonki", "Lasi", "Metalli", "Paperi"],
    aukioloajat: "La–Su 10–16",
    lisatiedot: "Pienehkö piste, vain viikonloppuisin miehitetty",
  },
};

export async function seed(knex: Knex): Promise<void> {
  // Fetch field IDs once
  const fields = await knex("recycler.fields")
    .where({ use_case_id: USE_CASE_ID })
    .select("id", "name");

  const fieldId = (name: string) => {
    const f = fields.find((f: { id: string; name: string }) => f.name === name);
    if (!f) throw new Error(`Field not found: ${name}`);
    return f.id;
  };

  const materiaalitId = fieldId("Materiaalit");
  const aukioloajatId = fieldId("Aukioloajat");
  const lisatiedotId = fieldId("Lisätiedot");

  // Fetch location IDs once
  const locations = await knex("recycler.locations")
    .where({ use_case_id: USE_CASE_ID })
    .select("id", "name");

  for (const loc of locations) {
    const data = LOCATION_DATA[loc.name as keyof typeof LOCATION_DATA];
    if (!data) continue;

    const rows = [
      {
        location_id: loc.id,
        field_id: materiaalitId,
        value: JSON.stringify(data.materiaalit),
      },
      {
        location_id: loc.id,
        field_id: aukioloajatId,
        value: JSON.stringify([data.aukioloajat]),
      },
      ...(data.lisatiedot
        ? [
            {
              location_id: loc.id,
              field_id: lisatiedotId,
              value: JSON.stringify([data.lisatiedot]),
            },
          ]
        : []),
    ];

    for (const row of rows) {
      await knex.raw(
        `
        INSERT INTO recycler.location_fields (id, location_id, field_id, value)
        VALUES (uuid_generate_v4(), ?::uuid, ?::uuid, ?::jsonb)
        ON CONFLICT (location_id, field_id) DO UPDATE SET value = EXCLUDED.value
        `,
        [row.location_id, row.field_id, row.value]
      );
    }
  }
}
