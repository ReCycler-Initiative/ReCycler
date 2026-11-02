import type { Knex } from "knex";

/**
 * Move the hardcoded location address columns (address, postal_code,
 * post_office) into address-type field values and drop the columns.
 *
 * For each use case with legacy address data the values go to its first
 * address field (lowest order). If the use case has no address field, one is
 * created on its oldest location type so the data isn't lost. Existing
 * non-empty field values are never overwritten.
 */

const DEFAULT_FIELD_NAME = "Osoite";

type LegacyAddressRow = {
  id: string;
  use_case_id: string;
  address: string | null;
  postal_code: string | null;
  post_office: string | null;
};

const clean = (value: string | null) => value?.trim() ?? "";

/**
 * Mapbox full addresses look like "Katu 1, 00100 Helsinki, Suomi"; keep only
 * the street part when the rest duplicates the postal code / post office.
 */
const toStreet = (address: string, postalCode: string, postOffice: string) => {
  let street = address.replace(/,\s*(Suomi|Finland)$/i, "");
  const suffix = [postalCode, postOffice].filter(Boolean).join(" ");
  if (suffix && street.toLowerCase().endsWith(`, ${suffix.toLowerCase()}`)) {
    street = street.slice(0, -(suffix.length + 2));
  }
  return street.trim();
};

const findOrCreateAddressField = async (
  knex: Knex,
  useCaseId: string
): Promise<string | null> => {
  const existing = await knex("recycler.fields")
    .where({ use_case_id: useCaseId, field_type: "address" })
    .orderByRaw(`"order" ASC NULLS LAST, created_at ASC`)
    .first("id");
  if (existing) return existing.id;

  const object = await knex("recycler.objects")
    .where({ use_case_id: useCaseId })
    .orderByRaw("created_at ASC NULLS LAST")
    .first("id");
  if (!object) {
    console.warn(
      `[migration:MoveLocationAddressToFields] use case ${useCaseId} has no location type; skipping address migration`
    );
    return null;
  }

  // Field names are unique per use case
  const takenNames = new Set(
    (
      await knex("recycler.fields").where({ use_case_id: useCaseId }).select("name")
    ).map((row: { name: string }) => row.name)
  );
  let name = DEFAULT_FIELD_NAME;
  for (let i = 2; takenNames.has(name); i++) {
    name = `${DEFAULT_FIELD_NAME} ${i}`;
  }

  const maxOrder = await knex("recycler.fields")
    .where({ object_id: object.id })
    .max<{ max: number | null }>("order as max")
    .first();

  const [created] = await knex("recycler.fields")
    .insert({
      name,
      field_type: "address",
      required: false,
      use_case_id: useCaseId,
      object_id: object.id,
      order: (maxOrder?.max ?? -1) + 1,
    })
    .returning("id");
  return created.id;
};

export async function up(knex: Knex): Promise<void> {
  const rows: LegacyAddressRow[] = await knex("recycler.locations")
    .whereNotNull("use_case_id")
    .andWhere((qb) =>
      qb
        .whereRaw("coalesce(trim(address), '') <> ''")
        .orWhereRaw("coalesce(trim(postal_code), '') <> ''")
        .orWhereRaw("coalesce(trim(post_office), '') <> ''")
    )
    .select("id", "use_case_id", "address", "postal_code", "post_office");

  const fieldIdByUseCase = new Map<string, string | null>();

  for (const row of rows) {
    if (!fieldIdByUseCase.has(row.use_case_id)) {
      fieldIdByUseCase.set(
        row.use_case_id,
        await findOrCreateAddressField(knex, row.use_case_id)
      );
    }
    const fieldId = fieldIdByUseCase.get(row.use_case_id);
    if (!fieldId) continue;

    const postalCode = clean(row.postal_code);
    const postOffice = clean(row.post_office);
    const value = [toStreet(clean(row.address), postalCode, postOffice), postalCode, postOffice];

    await knex.raw(
      `
        INSERT INTO recycler.location_fields (id, location_id, field_id, value)
        VALUES (uuid_generate_v4(), ?::uuid, ?::uuid, ?::jsonb)
        ON CONFLICT (location_id, field_id) DO UPDATE
        SET value = EXCLUDED.value
        WHERE NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(recycler.location_fields.value) AS v
          WHERE trim(v) <> ''
        )
      `,
      [row.id, fieldId, JSON.stringify(value)]
    );
  }

  await knex.schema.withSchema("recycler").alterTable("locations", (table) => {
    table.dropColumn("address");
    table.dropColumn("postal_code");
    table.dropColumn("post_office");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("recycler").alterTable("locations", (table) => {
    table.text("address");
    table.string("postal_code", 32);
    table.string("post_office", 255);
  });

  // Restore from each use case's first address field. Fields created by up()
  // are kept, since they can't be told apart from user-created ones.
  await knex.raw(`
    UPDATE recycler.locations l
    SET
      address = nullif(lf.value->>0, ''),
      postal_code = nullif(lf.value->>1, ''),
      post_office = nullif(lf.value->>2, '')
    FROM recycler.location_fields lf
    WHERE lf.location_id = l.id
      AND lf.field_id = (
        SELECT f.id
        FROM recycler.fields f
        WHERE f.use_case_id = l.use_case_id AND f.field_type = 'address'
        ORDER BY f."order" ASC NULLS LAST, f.created_at ASC
        LIMIT 1
      )
  `);
}
