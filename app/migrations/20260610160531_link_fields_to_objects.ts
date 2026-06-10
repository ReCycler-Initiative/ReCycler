import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Fetch all use cases
  const useCases = await knex('recycler.use_cases').select('id');
  
  if (useCases.length === 0) {
    throw new Error('No use cases found. Create use cases first.');
  }
  
  // Create default object for each use case
  const objectInserts = useCases.map(uc => ({
    name: 'Default Object',
    use_case_id: uc.id
  }));
  
  await knex('recycler.objects').insert(objectInserts);
  
  // Add foreign key to objects in fields table
  await knex.schema.withSchema('recycler').alterTable('fields', (table) => {
    table.uuid('object_id').nullable();
    table.foreign('object_id').references('id').inTable('recycler.objects');
  });
  
  // Link fields to objects based on use case
  for (const useCase of useCases) {
    const object = await knex('recycler.objects')
      .where({ use_case_id: useCase.id })
      .first('id');
    
    await knex('recycler.fields')
      .where({ use_case_id: useCase.id })
      .update({ object_id: object.id });
  }
  
  // Check for fields without object_id (orphaned fields)
  const orphanedFields = await knex('recycler.fields')
    .whereNull('object_id')
    .count('* as count')
    .first();
  
  if (orphanedFields && parseInt(orphanedFields.count as string) > 0) {
    throw new Error(`Found ${orphanedFields.count} fields without object_id. Fix data before continuing.`);
  }
  
  // Make object_id required
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
