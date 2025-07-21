import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userDevices, cpus, memory, storage, os, brands, tags } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	const id = parseInt(event.params.device_id);
	const device = await db.select().from(userDevices).where(eq(userDevices.id, id));

	if (!session) {
		throw error(401, 'Unauthorized');
	} else if (device.length === 0) {
		throw error(404, 'Device not found');
	} else if (device[0].userId !== session.user.id) {
		throw error(404, 'Device not found');
	}

	const cpuData = await db
		.select({ id: cpus.id, value: cpus.value, displayName: cpus.displayName })
		.from(cpus)
		.where(and(eq(cpus.userID, session.user.id), eq(cpus.id, device[0].cpu as number)));

	const memoryData = await db
		.select({ id: memory.id, value: memory.value, displayName: memory.displayName })
		.from(memory)
		.where(and(eq(memory.userID, session.user.id), eq(memory.id, device[0].memory as number)));

	const storageData = await db
		.select({ id: storage.id, value: storage.value, displayName: storage.displayName })
		.from(storage)
		.where(and(eq(storage.userID, session.user.id), eq(storage.id, device[0].storage as number)));

	const osData = await db
		.select({ id: os.id, value: os.value, displayName: os.displayName })
		.from(os)
		.where(and(eq(os.userID, session.user.id), eq(os.id, device[0].os as number)));

	const brandData = await db
		.select({ id: brands.id, value: brands.value, displayName: brands.displayName })
		.from(brands)
		.where(and(eq(brands.userId, session.user.id), eq(brands.id, device[0].brand as number)));

	const tagData = await db
		.select({
			id: tags.id,
			tagName: tags.tagName,
			tagColour: tags.tagColour,
			tagTextColour: tags.tagTextColour
		})
		.from(tags)
		.where(eq(tags.userId, session.user.id));

	const deviceTags = (device[0].tags || [])
		.map((tagId: number) => tagData.find((tag) => tag.id === tagId))
		.filter(Boolean);

	const processedDevice = {
		...device[0],
		cpu: cpuData[0]?.displayName ?? null,
		memory: memoryData[0]?.displayName ?? null,
		storage: storageData[0]?.displayName ?? null,
		os: osData[0]?.displayName ?? null,
		brand: brandData[0]?.displayName ?? null,
		tags: deviceTags
	};

	return {
		device: processedDevice
	};
};
