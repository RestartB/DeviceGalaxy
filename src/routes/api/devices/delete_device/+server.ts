import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

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
				.where(eq(userDevices.id, parseInt(deviceId)))
				.limit(1);

			if (device.length === 0) {
				return json({ error: 'Device not found' }, { status: 404 });
			}

			await tx.delete(userDevices).where(eq(userDevices.id, parseInt(deviceId)));

			// Check if any other devices exist for each parameter
			let cpuExists = null;
			if (device[0].cpu !== null && device[0].cpu !== undefined) {
				cpuExists = await tx
					.select()
					.from(cpus)
					.where(and(eq(cpus.userID, session.user.id), eq(cpus.id, device[0].cpu)))
					.limit(1);

				if (cpuExists.length === 0) {
					await tx.delete(cpus).where(eq(cpus.id, device[0].cpu));
				}
			}

			let memoryExists = null;
			if (device[0].memory !== null && device[0].memory !== undefined) {
				memoryExists = await tx
					.select()
					.from(memory)
					.where(and(eq(memory.userID, session.user.id), eq(memory.id, device[0].memory)))
					.limit(1);

				if (memoryExists.length === 0) {
					await tx.delete(memory).where(eq(memory.id, device[0].memory));
				}
			}

			let storageExists = null;
			if (device[0].storage !== null && device[0].storage !== undefined) {
				storageExists = await tx
					.select()
					.from(storage)
					.where(and(eq(storage.userID, session.user.id), eq(storage.id, device[0].storage)))
					.limit(1);

				if (storageExists.length === 0) {
					await tx.delete(storage).where(eq(storage.id, device[0].storage));
				}
			}

			let osExists = null;
			if (device[0].os !== null && device[0].os !== undefined) {
				osExists = await tx
					.select()
					.from(os)
					.where(and(eq(os.userID, session.user.id), eq(os.id, device[0].os)))
					.limit(1);

				if (osExists.length === 0) {
					await tx.delete(os).where(eq(os.id, device[0].os));
				}
			}

			let brandExists = null;
			if (device[0].brand !== null && device[0].brand !== undefined) {
				brandExists = await tx
					.select()
					.from(brands)
					.where(and(eq(brands.userId, session.user.id), eq(brands.id, device[0].brand)))
					.limit(1);

				if (brandExists.length === 0) {
					await tx.delete(brands).where(eq(brands.id, device[0].brand));
				}
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting device:', error);
		return json({ error: 'Failed to delete device' }, { status: 500 });
	}
}
