import { Knex } from "knex";

const schemaName = "recycler";
const tableName = "locations";

export async function up(knex: Knex): Promise<void> {
	const hasAddress = await knex.schema.withSchema(schemaName).hasColumn(tableName, "address");
	const hasPostalCode = await knex.schema.withSchema(schemaName).hasColumn(tableName, "postal_code");
	const hasPostOffice = await knex.schema.withSchema(schemaName).hasColumn(tableName, "post_office");

	await knex.schema.withSchema(schemaName).alterTable(tableName, (table) => {
		if (!hasAddress) table.text("address");
		if (!hasPostalCode) table.string("postal_code", 32);
		if (!hasPostOffice) table.string("post_office", 255);
	});
}

export async function down(knex: Knex): Promise<void> {
	const hasAddress = await knex.schema.withSchema(schemaName).hasColumn(tableName, "address");
	const hasPostalCode = await knex.schema.withSchema(schemaName).hasColumn(tableName, "postal_code");
	const hasPostOffice = await knex.schema.withSchema(schemaName).hasColumn(tableName, "post_office");

	await knex.schema.withSchema(schemaName).alterTable(tableName, (table) => {
		if (hasAddress) table.dropColumn("address");
		if (hasPostalCode) table.dropColumn("postal_code");
		if (hasPostOffice) table.dropColumn("post_office");
	});
}