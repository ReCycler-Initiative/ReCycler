import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Fetch all use cases and existing objects once to avoid duplicate inserts.
  const useCases = await knex('recycler.use_cases').select('id');
  const existingObjects = await knex('recycler.objects').select('id', 'use_case_id');
  const objectByUseCaseId = new Map<string, string>(
    existingObjects.map((row) => [row.use_case_id, row.id])
  );

  const missingObjects = useCases
    .filter((uc) => !objectByUseCaseId.has(uc.id))
    .map((uc) => ({
      name: 'Default Object',
      use_case_id: uc.id,
    }));

  if (missingObjects.length > 0) {
    await knex('recycler.objects').insert(missingObjects);
  }

  const refreshedObjects = await knex('recycler.objects').select('id', 'use_case_id');
  const refreshedObjectByUseCaseId = new Map<string, string>(
    refreshedObjects.map((row) => [row.use_case_id, row.id])
  );

  const hasObjectIdColumn = await knex.schema
    .withSchema('recycler')
    .hasColumn('fields', 'object_id');

  // Add nullable FK column only if it does not exist yet.
  if (!hasObjectIdColumn) {
    await knex.schema.withSchema('recycler').alterTable('fields', (table) => {
      table.uuid('object_id').nullable();
      table.foreign('object_id').references('id').inTable('recycler.objects');
    });
  }

  // Link fields to objects based on use case.
  for (const useCase of useCases) {
    const objectId = refreshedObjectByUseCaseId.get(useCase.id);
    if (!objectId) {
      continue;
    }

    await knex('recycler.fields')
      .where({ use_case_id: useCase.id })
      .update({ object_id: objectId });
  }

  // If orphaned fields remain, keep column nullable so migration can continue.
  const orphanedFields = await knex('recycler.fields')
    .whereNull('object_id')
    .count('* as count')
    .first();

  const orphanedCount = parseInt(String(orphanedFields?.count ?? 0), 10);
  if (orphanedCount > 0) {
    console.warn(
      `[migration:20260610160531] ${orphanedCount} field(s) still missing object_id. Keeping object_id nullable.`
    );
    return;
  }

  // Make object_id required only when all rows are linked.
  await knex.schema.withSchema('recycler').alterTable('fields', (table) => {
    table.uuid('object_id').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('recycler').alterTable('fields', (table) => {
    table.dropForeign(['object_id']);
    table.dropColumn('object_id');
  });
  
  // Remove created default objects
  await knex('recycler.objects')
    .where({ name: 'Default Object' })
    .delete();
}
