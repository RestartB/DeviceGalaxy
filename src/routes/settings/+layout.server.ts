import type { LayoutServerLoad } from './$types';

import { db } from '$lib/server/db';
import { userDevices, tags } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.parent();

	if (!session || !user) {
		return {
			totalDevices: 0,
			totalTags: 0
		};
	}

	const totalDevices = await db
		.select({ count: count(userDevices.id) })
		.from(userDevices)
		.where(eq(userDevices.userId, user.id));
	const totalTags = await db
		.select({ count: count(tags.id) })
		.from(tags)
		.where(eq(tags.userId, user.id));

	return {
		totalDevices: totalDevices[0].count,
		totalTags: totalTags[0].count
	};
};
