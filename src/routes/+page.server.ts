import type { PageServerLoad } from './$types';

import { db } from '$lib/server/db';
import { userDevices, cpus, memory, storage, os, brands, tags } from '$lib/server/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { session, user } = await parent();
	
	if (!session || !user) {
		return {
			devices: [],
			totalCount: 0
		};
	}

	// Fetch attributes for devices
	const cpuData = await db
		.select({ id: cpus.id, value: cpus.value, displayName: cpus.displayName })
		.from(cpus)
		.where(eq(cpus.userID, user.id));

	const memoryData = await db
		.select({ id: memory.id, value: memory.value, displayName: memory.displayName })
		.from(memory)
		.where(eq(memory.userID, user.id));

	const storageData = await db
		.select({ id: storage.id, value: storage.value, displayName: storage.displayName })
		.from(storage)
		.where(eq(storage.userID, user.id));

	const osData = await db
		.select({ id: os.id, value: os.value, displayName: os.displayName })
		.from(os)
		.where(eq(os.userID, user.id));

	const brandData = await db
		.select({ id: brands.id, value: brands.value, displayName: brands.displayName })
		.from(brands)
		.where(eq(brands.userId, user.id));

	const tagData = await db
		.select({
			id: tags.id,
			tagName: tags.tagName,
			tagColour: tags.tagColour,
			tagTextColour: tags.tagTextColour
		})
		.from(tags)
		.where(eq(tags.userId, user.id));

	const createdAtDevices = await db
		.select()
		.from(userDevices)
		.where(eq(userDevices.userId, user.id))
		.limit(5)
		.orderBy(desc(userDevices.createdAt));

	const createdAtMatchedDevices = createdAtDevices.map((device) => {
		const deviceTagIds = device.tags || [];

		const deviceTags = deviceTagIds
			.map((tagId: number) => tagData.find((tag) => tag.id === tagId))
			.filter(Boolean);

		return {
			...device,
			cpu: cpuData.find((cpu) => cpu.id === device.cpu)?.displayName,
			memory: memoryData.find((mem) => mem.id === device.memory)?.displayName,
			storage: storageData.find((stor) => stor.id === device.storage)?.displayName,
			os: osData.find((osItem) => osItem.id === device.os)?.displayName,
			brand: brandData.find((brand) => brand.id === device.brand)?.displayName,
			tags: deviceTags
		};
	});

	const updatedAtDevices = await db
		.select()
		.from(userDevices)
		.where(eq(userDevices.userId, user.id))
		.limit(5)
		.orderBy(desc(userDevices.updatedAt));

	const updatedAtMatchedDevices = updatedAtDevices.map((device) => {
		const deviceTagIds = device.tags || [];

		const deviceTags = deviceTagIds
			.map((tagId: number) => tagData.find((tag) => tag.id === tagId))
			.filter(Boolean);

		return {
			...device,
			cpu: cpuData.find((cpu) => cpu.id === device.cpu)?.displayName,
			memory: memoryData.find((mem) => mem.id === device.memory)?.displayName,
			storage: storageData.find((stor) => stor.id === device.storage)?.displayName,
			os: osData.find((osItem) => osItem.id === device.os)?.displayName,
			brand: brandData.find((brand) => brand.id === device.brand)?.displayName,
			tags: deviceTags
		};
	});

	// Get total count of devices for pagination
	const totalCount = await db
		.select({ count: count() })
		.from(userDevices)
		.where(eq(userDevices.userId, user.id));

	const greetings = [
		'Welcome back,',
		'Hi,',
		'Hello,',
		'Good to see you,',
		'Greetings,',
		'Hey there,',
		"What's up,",
		'Hai,'
	];
	const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

	return {
		recentlyCreated: createdAtMatchedDevices,
		recentlyUpdated: updatedAtMatchedDevices,
		totalCount: totalCount[0].count,
		randomGreeting
	};
};
