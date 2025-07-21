import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	userDevices,
	cpus,
	gpus,
	memory,
	storage,
	os,
	brands,
	tags,
	shares,
	user
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
	// Get share ID
	const shareID = event.params.shareid;

	if (!shareID) {
		return error(400, 'Share ID is required');
	}

	// Check if share ID is in database
	const share = await db.select().from(shares).where(eq(shares.id, shareID)).get();

	if (share === undefined) {
		return error(404, 'Share not found');
	}

	// Get user's name and PFP
	const shareUser = await db
		.select({ id: user.id, name: user.name, image: user.image })
		.from(user)
		.where(eq(user.id, share.userId))
		.get();

	if (share.type === 2 && share.sharedDevice) {
		const device = await db
			.select()
			.from(userDevices)
			.where(eq(userDevices.id, share.sharedDevice));

		const cpuData = await db
			.select({ id: cpus.id, value: cpus.value, displayName: cpus.displayName })
			.from(cpus)
			.where(eq(cpus.id, device[0].cpu as number));

		const gpuData = await db
			.select({ id: gpus.id, value: gpus.value, displayName: gpus.displayName })
			.from(gpus)
			.where(eq(gpus.id, device[0].gpu as number));

		const memoryData = await db
			.select({ id: memory.id, value: memory.value, displayName: memory.displayName })
			.from(memory)
			.where(eq(memory.id, device[0].memory as number));

		const storageData = await db
			.select({ id: storage.id, value: storage.value, displayName: storage.displayName })
			.from(storage)
			.where(eq(storage.id, device[0].storage as number));

		const osData = await db
			.select({ id: os.id, value: os.value, displayName: os.displayName })
			.from(os)
			.where(eq(os.id, device[0].os as number));

		const brandData = await db
			.select({ id: brands.id, value: brands.value, displayName: brands.displayName })
			.from(brands)
			.where(eq(brands.id, device[0].brand as number));

		const tagData = await db
			.select({
				id: tags.id,
				tagName: tags.tagName,
				tagColour: tags.tagColour,
				tagTextColour: tags.tagTextColour
			})
			.from(tags);

		const deviceTags = (device[0].tags || [])
			.map((tagId: number) => tagData.find((tag) => tag.id === tagId))
			.filter(Boolean);

		const processedDevice = {
			...device[0],
			cpu: cpuData[0]?.displayName ?? null,
			gpu: gpuData[0]?.displayName ?? null,
			memory: memoryData[0]?.displayName ?? null,
			storage: storageData[0]?.displayName ?? null,
			os: osData[0]?.displayName ?? null,
			brand: brandData[0]?.displayName ?? null,
			tags: deviceTags
		};

		return {
			share,
			shareUser,
			baseURL: event.url.origin,
			device: processedDevice
		};
	}
	return { share, shareUser, baseURL: event.url.origin };
};
