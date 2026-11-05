import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import knex, { Knex } from "knex";
import config from "../knexfile";
import { deleteUnusedLocationType } from "../src/services/location-type-deletion";

const connection = config.connection as { host?: string; port?: number };
assert.ok(["localhost", "127.0.0.1"].includes(connection.host ?? ""), "Tests require a local database");
const database = knex(config);
let useCase: { id: string; organization_id: string };

before(async () => {
  useCase = await database("recycler.use_cases")
    .whereNull("deleted_at")
    .first("id", "organization_id");
  assert.ok(useCase, "Tests require an existing local use case and current migrations");
});

after(async () => { await database.destroy(); });

const withFixture = async (check: (
  transaction: Knex.Transaction,
  typeId: string,
  fieldId: string
) => Promise<void>) => {
  const transaction = await database.transaction();
  const typeId = randomUUID();
  const fieldId = randomUUID();
  try {
    await transaction("recycler.objects").insert({
      id: typeId, use_case_id: useCase.id, name: "Deletion test type",
    });
    await transaction("recycler.fields").insert({
      id: fieldId, object_id: typeId, use_case_id: useCase.id,
      name: "Deletion test field", field_type: "text_input",
    });
    await check(transaction, typeId, fieldId);
  } finally {
    await transaction.rollback();
  }
};

test("unused type and its fields are deleted together", async () => {
  await withFixture(async (transaction, typeId, fieldId) => {
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, typeId), "deleted");
    assert.equal(await transaction("recycler.objects").where("id", typeId).first(), undefined);
    assert.equal(await transaction("recycler.fields").where("id", fieldId).first(), undefined);
  });
});

test("type with a location cannot be deleted", async () => {
  await withFixture(async (transaction, typeId, fieldId) => {
    const locationId = randomUUID();
    await transaction("recycler.locations").insert({
      id: locationId, use_case_id: useCase.id, object_id: typeId, name: "Deletion test location",
    });
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, typeId), "in_use");
    assert.ok(await transaction("recycler.objects").where("id", typeId).first());
    assert.ok(await transaction("recycler.fields").where("id", fieldId).first());
    assert.ok(await transaction("recycler.locations").where("id", locationId).first());
  });
});

test("type with a data source cannot be deleted", async () => {
  await withFixture(async (transaction, typeId) => {
    await transaction("recycler.datasources").insert({
      use_case_id: useCase.id, object_id: typeId,
      name: "Deletion test source", url: "https://example.invalid/data",
    });
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, typeId), "in_use");
  });
});

test("field values without a direct type link prevent deletion", async () => {
  await withFixture(async (transaction, typeId, fieldId) => {
    const locationId = randomUUID();
    await transaction("recycler.locations").insert({
      id: locationId, use_case_id: useCase.id, name: "Deletion test untyped location",
    });
    await transaction("recycler.location_fields").insert({
      location_id: locationId, field_id: fieldId, value: JSON.stringify(["Keep this value"]),
    });
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, typeId), "in_use");
    assert.ok(await transaction("recycler.location_fields").where("field_id", fieldId).first());
  });
});

test("field mappings without a direct type link prevent deletion", async () => {
  await withFixture(async (transaction, typeId, fieldId) => {
    const datasourceId = randomUUID();
    await transaction("recycler.datasources").insert({
      id: datasourceId, use_case_id: useCase.id,
      name: "Deletion test untyped source", url: "https://example.invalid/data",
    });
    await transaction("recycler.datasource_field_mappings").insert({
      datasource_id: datasourceId, field_id: fieldId, source_field: "name",
    });
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, typeId), "in_use");
    assert.ok(await transaction("recycler.datasource_field_mappings").where("field_id", fieldId).first());
  });
});

test("wrong organization, wrong use case and missing type do not delete data", async () => {
  await withFixture(async (transaction, typeId, fieldId) => {
    assert.equal(await deleteUnusedLocationType(transaction, randomUUID(), useCase.id, typeId), "not_found");
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, randomUUID(), typeId), "not_found");
    assert.equal(await deleteUnusedLocationType(transaction, useCase.organization_id, useCase.id, randomUUID()), "not_found");
    assert.ok(await transaction("recycler.objects").where("id", typeId).first());
    assert.ok(await transaction("recycler.fields").where("id", fieldId).first());
  });
});