import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, asc, desc, count, and, inArray } from 'drizzle-orm';
import { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

    const offset = parseInt(event.url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(event.url.searchParams.get('limit') || '20', 10);
    const sortType = event.url.searchParams.get('sortType') || 'asc';

	const selectedFilters = {
        cpu: event.url.searchParams.get('cpu')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)),
		memory: event.url.searchParams.get('memory')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)),
		storage: event.url.searchParams.get('storage')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)),
		os: event.url.searchParams.get('os')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)),
		brand: event.url.searchParams.get('brand')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
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
        const conditions = [eq(userDevices.userId, session.user.id)];

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
			.where(eq(cpus.userID, session.user.id));

		const memoryData = await db
			.select({ id: memory.id, value: memory.value, displayName: memory.displayName })
			.from(memory)
			.where(eq(memory.userID, session.user.id));

		const storageData = await db
			.select({ id: storage.id, value: storage.value, displayName: storage.displayName })
			.from(storage)
			.where(eq(storage.userID, session.user.id));

		const osData = await db
			.select({ id: os.id, value: os.value, displayName: os.displayName })
			.from(os)
			.where(eq(os.userID, session.user.id));
		
		const brandData = await db
			.select({ id: brands.id, value: brands.value, displayName: brands.displayName })
			.from(brands)
			.where(eq(brands.userId, session.user.id));

		const matchedDevices = devices.map(device => {
			return {
				...device,
				cpu: cpuData.find(cpu => cpu.id === device.cpu)?.displayName || 'Unknown CPU',
				memory: memoryData.find(mem => mem.id === device.memory)?.displayName || 'Unknown Memory',
				storage: storageData.find(stor => stor.id === device.storage)?.displayName || 'Unknown Storage',
				os: osData.find(osItem => osItem.id === device.os)?.displayName || 'Unknown OS',
				brand: brandData.find(brand => brand.id === device.brand)?.displayName || 'Unknown Brand'
			};
		});

		// Get total count of devices for pagination
		const totalCount = await db.select({ count: count() }).from(userDevices).where(eq(userDevices.userId, session.user.id));

		return json({
			devices: matchedDevices,
			found: matchedDevices.length,
			totalDevices: totalCount[0].count,
		});
	} catch (error) {
		console.error('Error fetching devices:', error);
		return json({ error: 'Failed to fetch devices' }, { status: 500 });
	}
}
