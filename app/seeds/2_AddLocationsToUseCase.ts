import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Insert locations for the use case
    await knex.raw(`
        INSERT INTO recycler.locations (name, use_case_id, geom) VALUES
        ('Rinki-ekopiste Keskusta', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.761, 61.4978), 4326)),
        ('Rinki-ekopiste Kaleva', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.792, 61.501), 4326)),
        ('Rinki-ekopiste Hervanta', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.85, 61.45), 4326)),
        ('Rinki-ekopiste Lielahti', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.685, 61.515), 4326)),
        ('Rinki-ekopiste Tesoma', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.632, 61.482), 4326)),
        ('Rinki-ekopiste Linnainmaa', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.828, 61.508), 4326)),
        ('Rinki-ekopiste Härmälä', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.745, 61.468), 4326)),
        ('Rinki-ekopiste Peltolammi', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.72, 61.442), 4326)),
        ('Rinki-ekopiste Multisilta', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.81, 61.435), 4326)),
        ('Rinki-ekopiste Kaukajärvi', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.865, 61.478), 4326)),
        ('Rinki-ekopiste Messukylä', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.835, 61.492), 4326)),
        ('Rinki-ekopiste Nekala', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.798, 61.475), 4326)),
        ('Rinki-ekopiste Rahola', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.668, 61.495), 4326)),
        ('Rinki-ekopiste Takahuhti', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.815, 61.52), 4326)),
        ('Rinki-ekopiste Atala', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.872, 61.462), 4326)),
        ('Rinki-ekopiste Lamminpää', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.615, 61.472), 4326)),
        ('Rinki-ekopiste Ikuri', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.648, 61.505), 4326)),
        ('Rinki-ekopiste Olkahinen', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.84, 61.515), 4326)),
        ('Rinki-ekopiste Vuores', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.785, 61.428), 4326)),
        ('Rinki-ekopiste Kämmenniemi', '88dca1e6-b1f4-4151-ae9d-9c59eb6cb04f', ST_SetSRID(ST_MakePoint(23.71, 61.558), 4326));
    `);
};
