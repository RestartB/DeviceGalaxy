import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userDevices, cpus, gpus, memory, storage, os, brands } from '$lib/server/db/schema';

type TableWithUserField =
	| typeof cpus
	| typeof gpus
	| typeof memory
	| typeof storage
	| typeof os
	| typeof brands;
type DatabaseType = typeof db;
type TransactionType = Parameters<Parameters<DatabaseType['transaction']>[0]>[0];

export default async function deleteOrphans(
	tx: TransactionType,
	table: TableWithUserField,
	recordId: number,
	userId: string,
	deviceField: keyof typeof userDevices.$inferSelect
) {
	if (!recordId) return;

	// brands use a different name
	let userFieldCondition;
	if (table === cpus || table === gpus || table === memory || table === storage || table === os) {
		userFieldCondition = eq((table as typeof cpus).userID, userId);
	} else {
		userFieldCondition = eq((table as typeof brands).userId, userId);
	}

	const exists = await tx
		.select()
		.from(table)
		.where(and(userFieldCondition, eq(table.id, recordId)))
		.get();

	if (!exists) return;

	const matchingDevices = await tx
		.select()
		.from(userDevices)
		.where(and(eq(userDevices.userId, userId), eq(userDevices[deviceField], recordId)));

	if (matchingDevices.length === 0) {
		await tx.delete(table).where(eq(table.id, recordId));
	}
}
