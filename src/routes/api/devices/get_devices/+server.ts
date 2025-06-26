import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, asc, desc } from 'drizzle-orm';
import { userDevices } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const offset = parseInt(new URLSearchParams(event.request.url).get('offset') || '0', 10);
	const limit = parseInt(new URLSearchParams(event.request.url).get('limit') || '20', 10);
	const sortType = new URLSearchParams(event.request.url).get('sortType') || 'asc';

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
		const devices = await db
			.select()
			.from(userDevices)
			.where(eq(userDevices.userId, session.user.id))
			.offset(offset)
			.limit(limit)
			.orderBy(orderBy);

		return json({
			devices,
			total: devices.length
		});
	} catch (error) {
		console.error('Error fetching devices:', error);
		return json({ error: 'Failed to fetch devices' }, { status: 500 });
	}
}
