import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, asc, desc, count, and, inArray, like, sql } from 'drizzle-orm';
import {
	userDevices,
	cpus,
	memory,
	storage,
	os,
	brands,
	tags,
	shares
} from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	const shareIdRaw = event.url.searchParams.get('share');

	if (!session && !shareIdRaw) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check share ID is valid
	const shareId = parseInt(shareIdRaw || '-1');
	if (shareIdRaw && (isNaN(shareId) || shareId < 0)) {
		return json({ error: 'Invalid share ID' }, { status: 400 });
	}

	// Check for share in database
	let share;
	if (shareIdRaw) {
		share = await db
			.select()
			.from(shares)
			.where(eq(shares.id, shareId))
			.get();

		if (!share) {
			return json({ error: 'Share not found' }, { status: 404 });
		}

		if (share.type !== 0) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	}

	const offset = parseInt(event.url.searchParams.get('offset') || '0', 10);
	const limit = parseInt(event.url.searchParams.get('limit') || '20', 10);
	const sortType = event.url.searchParams.get('sortType') || 'asc';
	const searchQuery = event.url.searchParams.get('search');

	const selectedFilters = {
		cpu: event.url.searchParams
			.get('cpu')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id)),
		memory: event.url.searchParams
			.get('memory')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id)),
		storage: event.url.searchParams
			.get('storage')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id)),
		os: event.url.searchParams
			.get('os')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id)),
		brand: event.url.searchParams
			.get('brand')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id)),
		tags: event.url.searchParams
			.get('tags')
			?.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id))
	};

	let orderBy;

	if (sortType === 'dateAsc') {
		orderBy = asc(userDevices.createdAt);
	} else if (sortType === 'dateDesc') {
		orderBy = desc(userDevices.createdAt);
	} else if (sortType === 'nameAsc') {
		orderBy = asc(userDevices.deviceName);
	} else if (sortType === 'nameDesc') {
		orderBy = desc(userDevices.deviceName);
	} else {
		orderBy = asc(userDevices.deviceName);
	}

	try {
		const conditions = [];
		let userId = '';

		if (share) {
			conditions.push(eq(userDevices.userId, share.userId));
			userId = share.userId;
		} else if (session?.user) {
			conditions.push(eq(userDevices.userId, session.user.id));
			userId = session.user.id;
		}

		if (searchQuery) {
			conditions.push(like(userDevices.deviceName, `%${searchQuery}%`));
		}

		if ((selectedFilters.cpu ?? []).length > 0) {
			conditions.push(inArray(userDevices.cpu, selectedFilters.cpu ?? []));
		}
		if ((selectedFilters.memory ?? []).length > 0) {
			conditions.push(inArray(userDevices.memory, selectedFilters.memory ?? []));
		}
		if ((selectedFilters.storage ?? []).length > 0) {
			conditions.push(inArray(userDevices.storage, selectedFilters.storage ?? []));
		}
		if ((selectedFilters.os ?? []).length > 0) {
			conditions.push(inArray(userDevices.os, selectedFilters.os ?? []));
		}
		if ((selectedFilters.brand ?? []).length > 0) {
			conditions.push(inArray(userDevices.brand, selectedFilters.brand ?? []));
		}
		if ((selectedFilters.tags ?? []).length > 0) {
			const tagConditions = selectedFilters.tags!.map(
				(tagId) =>
					sql`EXISTS (SELECT 1 FROM json_each(${userDevices.tags}) WHERE json_each.value = ${tagId})`
			);

			if (tagConditions.length > 0) {
				const orCondition = and(...tagConditions);
				if (orCondition) {
					conditions.push(orCondition);
				}
			}
		}

		const devices = await db
			.select()
			.from(userDevices)
			.where(and(...conditions))
			.offset(offset)
			.limit(limit)
			.orderBy(orderBy);

		// Fetch additional attributes for each device
		const cpuData = await db
			.select({ id: cpus.id, value: cpus.value, displayName: cpus.displayName })
			.from(cpus)
			.where(eq(cpus.userID, userId));

		const memoryData = await db
			.select({ id: memory.id, value: memory.value, displayName: memory.displayName })
			.from(memory)
			.where(eq(memory.userID, userId));

		const storageData = await db
			.select({ id: storage.id, value: storage.value, displayName: storage.displayName })
			.from(storage)
			.where(eq(storage.userID, userId));

		const osData = await db
			.select({ id: os.id, value: os.value, displayName: os.displayName })
			.from(os)
			.where(eq(os.userID, userId));

		const brandData = await db
			.select({ id: brands.id, value: brands.value, displayName: brands.displayName })
			.from(brands)
			.where(eq(brands.userId, userId));

		const tagData = await db
			.select({
				id: tags.id,
				tagName: tags.tagName,
				tagColour: tags.tagColour,
				tagTextColour: tags.tagTextColour
			})
			.from(tags)
			.where(eq(tags.userId, String(userId)));

		const matchedDevices = devices.map((device) => {
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
			.where(and(...conditions));

		return json({
			devices: matchedDevices,
			found: matchedDevices.length,
			totalDevices: totalCount[0].count
		});
	} catch (error) {
		console.error('Error fetching devices:', error);
		return json({ error: 'Failed to fetch devices' }, { status: 500 });
	}
}
