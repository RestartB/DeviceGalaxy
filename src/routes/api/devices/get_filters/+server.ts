import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { userDevices } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const brands = await db
			.select({ brand: userDevices.brand })
			.from(userDevices)
			.where(eq(userDevices.userId, session.user.id))
			.groupBy(userDevices.brand);
		
		const cpus = await db
			.select({ cpu: userDevices.cpu })
			.from(userDevices)
			.where(eq(userDevices.userId, session.user.id))
			.groupBy(userDevices.cpu);
		
		const memory = await db
			.select({ memory: userDevices.memory })
			.from(userDevices)
			.where(eq(userDevices.userId, session.user.id))
			.groupBy(userDevices.memory);
		
		const storage = await db
			.select({ storage: userDevices.storage })
			.from(userDevices)
			.where(eq(userDevices.userId, session.user.id))
			.groupBy(userDevices.storage);

		return json({
			brands: brands,
			totalBrands: brands.length,
			cpus: cpus,
			totalCpus: cpus.length,
			memory: memory,
			totalMemory: memory.length,
			storage: storage,
			totalStorage: storage.length
		});
	} catch (error) {
		console.error('Error fetching filters:', error);
		return json({ error: 'Failed to fetch filters' }, { status: 500 });
	}
}
