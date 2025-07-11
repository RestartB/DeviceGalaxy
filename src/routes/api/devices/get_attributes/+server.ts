import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cpus, memory, storage, os, brands, shares } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	const shareId = event.url.searchParams.get('share');

	if (!session && !shareId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check for share in database
	let share;
	if (shareId) {
		share = await db.select().from(shares).where(eq(shares.id, shareId)).get();

		if (!share) {
			return json({ error: 'Share not found' }, { status: 404 });
		}

		if (share.type !== 0) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	}

	try {
		let userId = '';

		if (share) {
			userId = share.userId;
		} else if (session?.user) {
			userId = session.user.id;
		}

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

		return json({
			cpus: cpuData,
			memory: memoryData,
			storage: storageData,
			os: osData,
			brands: brandData
		});
	} catch (error) {
		console.error('Error fetching attributes:', error);
		return json({ error: 'Failed to fetch attributes' }, { status: 500 });
	}
}
