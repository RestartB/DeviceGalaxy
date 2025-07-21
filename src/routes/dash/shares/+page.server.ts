import { eq, and, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
import { shares, userDevices } from '$lib/server/db/schema';

export const load = async (event) => {
	const parent = await event.parent();

	if (!parent.user) {
		return { shares: [] };
	}

	const accountShares = await db
		.select()
		.from(shares)
		.where(and(eq(shares.userId, parent.user.id), eq(shares.type, 0)))
		.orderBy(asc(shares.id));

	const tagShares = await db
		.select()
		.from(shares)
		.where(and(eq(shares.userId, parent.user.id), eq(shares.type, 1)))
		.orderBy(asc(shares.id));

	const deviceShares = await db
		.select()
		.from(shares)
		.where(and(eq(shares.userId, parent.user.id), eq(shares.type, 2)))
		.orderBy(asc(shares.id));

	// Get user devices
	const userDevicesData = await db
		.select()
		.from(userDevices)
		.where(eq(userDevices.userId, parent.user.id))
		.orderBy(asc(userDevices.id));

	// Match device to shares
	const matchedDevices = deviceShares.map((share) => {
		const device = userDevicesData.find((device) => device.id === share.sharedDevice);
		return {
			...device,
			shareId: share.id,
			shareType: share.type
		};
	});

	return {
		accountShares: accountShares as InferSelectModel<typeof shares>[],
		tagShares: tagShares as InferSelectModel<typeof shares>[],
		deviceShares: matchedDevices,
	};
};
