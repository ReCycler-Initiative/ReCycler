import type { Knex } from "knex";

export const deleteUnusedLocationType = async (
  database: Knex,
  organizationId: string,
  useCaseId: string,
  locationTypeId: string
): Promise<"deleted" | "not_found" | "in_use"> =>
  database.transaction(async (transaction) => {
    const locationType = await transaction("recycler.objects as o")
      .join("recycler.use_cases as uc", "uc.id", "o.use_case_id")
      .where("o.id", locationTypeId)
      .where("uc.id", useCaseId)
      .where("uc.organization_id", organizationId)
      .whereNull("uc.deleted_at")
      .select("o.id")
      .forUpdate("o")
      .first();

    if (!locationType) return "not_found";

    const fields = await transaction("recycler.fields")
      .where("object_id", locationTypeId)
      .select("id")
      .forUpdate();
    const fieldIds = fields.map((field) => field.id);
    const references = await Promise.all([
      transaction("recycler.locations").where("object_id", locationTypeId).first("id"),
      transaction("recycler.datasources").where("object_id", locationTypeId).first("id"),
      transaction("recycler.location_fields").whereIn("field_id", fieldIds).first("field_id"),
      transaction("recycler.datasource_field_mappings").whereIn("field_id", fieldIds).first("field_id"),
    ]);

    if (references.some(Boolean)) return "in_use";

    await transaction("recycler.fields").where("object_id", locationTypeId).delete();
    await transaction("recycler.objects").where("id", locationTypeId).delete();
    return "deleted";
  });