import { Knex } from "knex";

const USE_CASE_ID = "88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f";

const LOCATIONS = [
  { name: "Rinki-ekopiste Keskusta",    lng: 23.761, lat: 61.4978 },
  { name: "Rinki-ekopiste Kaleva",      lng: 23.792, lat: 61.501  },
  { name: "Rinki-ekopiste Hervanta",    lng: 23.85,  lat: 61.45   },
  { name: "Rinki-ekopiste Lielahti",    lng: 23.685, lat: 61.515  },
  { name: "Rinki-ekopiste Tesoma",      lng: 23.632, lat: 61.482  },
  { name: "Rinki-ekopiste Linnainmaa",  lng: 23.828, lat: 61.508  },
  { name: "Rinki-ekopiste Härmälä",     lng: 23.745, lat: 61.468  },
  { name: "Rinki-ekopiste Peltolammi",  lng: 23.72,  lat: 61.442  },
  { name: "Rinki-ekopiste Multisilta",  lng: 23.81,  lat: 61.435  },
  { name: "Rinki-ekopiste Kaukajärvi",  lng: 23.865, lat: 61.478  },
  { name: "Rinki-ekopiste Messukylä",   lng: 23.835, lat: 61.492  },
  { name: "Rinki-ekopiste Nekala",      lng: 23.798, lat: 61.475  },
  { name: "Rinki-ekopiste Rahola",      lng: 23.668, lat: 61.495  },
  { name: "Rinki-ekopiste Takahuhti",   lng: 23.815, lat: 61.52   },
  { name: "Rinki-ekopiste Atala",       lng: 23.872, lat: 61.462  },
  { name: "Rinki-ekopiste Lamminpää",   lng: 23.615, lat: 61.472  },
  { name: "Rinki-ekopiste Ikuri",       lng: 23.648, lat: 61.505  },
  { name: "Rinki-ekopiste Olkahinen",   lng: 23.84,  lat: 61.515  },
  { name: "Rinki-ekopiste Vuores",      lng: 23.785, lat: 61.428  },
  { name: "Rinki-ekopiste Kämmenniemi", lng: 23.71,  lat: 61.558  },
];

export async function seed(knex: Knex): Promise<void> {
  for (const loc of LOCATIONS) {
    await knex.raw(
      `
      INSERT INTO recycler.locations (name, use_case_id, geom)
      SELECT ?, ?::uuid, ST_SetSRID(ST_MakePoint(?, ?), 4326)
      WHERE NOT EXISTS (
        SELECT 1 FROM recycler.locations
        WHERE name = ? AND use_case_id = ?::uuid
      )
      `,
      [loc.name, USE_CASE_ID, loc.lng, loc.lat, loc.name, USE_CASE_ID]
    );
  }
}
