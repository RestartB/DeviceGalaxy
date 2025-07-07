import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';

export async function DELETE(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = event.url.searchParams.get('id');
	if (!deviceId) {
		return json({ message: 'Device ID is required' }, { status: 400 });
	}

	try {
		await db.transaction(async (tx) => {
			const device = await tx
				.select()
				.from(userDevices)
				.where(and(eq(userDevices.id, parseInt(deviceId)), eq(userDevices.userId, session.user.id)))
				.get();

			if (!device) {
				return json({ error: 'Device not found' }, { status: 404 });
			}

			await tx.delete(userDevices).where(eq(userDevices.id, parseInt(deviceId)));

			// Check if any other devices exist for each parameter
			let cpuExists = null;
			if (device.cpu !== null && device.cpu !== undefined) {
				cpuExists = await tx
					.select()
					.from(cpus)
					.where(and(eq(cpus.userID, session.user.id), eq(cpus.id, device.cpu)))
					.limit(1);

				if (cpuExists.length === 0) {
					await tx.delete(cpus).where(eq(cpus.id, device.cpu));
				}
			}

			let memoryExists = null;
			if (device.memory !== null && device.memory !== undefined) {
				memoryExists = await tx
					.select()
					.from(memory)
					.where(and(eq(memory.userID, session.user.id), eq(memory.id, device.memory)))
					.limit(1);

				if (memoryExists.length === 0) {
					await tx.delete(memory).where(eq(memory.id, device.memory));
				}
			}

			let storageExists = null;
			if (device.storage !== null && device.storage !== undefined) {
				storageExists = await tx
					.select()
					.from(storage)
					.where(and(eq(storage.userID, session.user.id), eq(storage.id, device.storage)))
					.limit(1);

				if (storageExists.length === 0) {
					await tx.delete(storage).where(eq(storage.id, device.storage));
				}
			}

			let osExists = null;
			if (device.os !== null && device.os !== undefined) {
				osExists = await tx
					.select()
					.from(os)
					.where(and(eq(os.userID, session.user.id), eq(os.id, device.os)))
					.limit(1);

				if (osExists.length === 0) {
					await tx.delete(os).where(eq(os.id, device.os));
				}
			}

			let brandExists = null;
			if (device.brand !== null && device.brand !== undefined) {
				brandExists = await tx
					.select()
					.from(brands)
					.where(and(eq(brands.userId, session.user.id), eq(brands.id, device.brand)))
					.limit(1);

				if (brandExists.length === 0) {
					await tx.delete(brands).where(eq(brands.id, device.brand));
				}
			}

			// Delete device's image folder
			const deviceImagePath = join(process.cwd(), 'user_uploads', 'device', deviceId.toString());
			if (existsSync(deviceImagePath)) {
				await rm(deviceImagePath, { recursive: true });
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting device:', error);
		return json({ error: 'Failed to delete device' }, { status: 500 });
	}
}
