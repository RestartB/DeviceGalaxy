import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices, shares } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Get share ID
	const shareId = event.url.searchParams.get('share');

	if (!session && !shareId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = event.params.deviceid;
	if (!deviceId) {
		return json({ message: 'Device ID is required' }, { status: 400 });
	}

	const imageId = event.params.imageid;
	if (!imageId) {
		return json({ message: 'Image ID is required' }, { status: 400 });
	}

	let device;
	if (shareId) {
		// Get share
		const share = await db
			.select()
			.from(shares)
			.where(eq(shares.id, shareId))
			.get();

		if (!share) {
			return json({ error: 'Share not found' }, { status: 404 });
		}

		if (share.type !== 0 && share.sharedDevice !== parseInt(deviceId)) {
			return json({ error: 'Device does not match share' }, { status: 401 });
		}

		device = await db
			.select()
			.from(userDevices)
			.where(and(eq(userDevices.id, parseInt(deviceId)), eq(userDevices.userId, share.userId)))
			.get();
	} else if (session) {
		device = await db
			.select()
			.from(userDevices)
			.where(and(eq(userDevices.id, parseInt(deviceId)), eq(userDevices.userId, session.user.id)))
			.get();
	}

	if (!device) {
		return json({ error: 'Device not found' }, { status: 404 });
	}

	if (
		!device.internalImages ||
		!Array.isArray(device.internalImages) ||
		device.internalImages.length === 0 ||
		!device.internalImages.includes(imageId)
	) {
		return json({ error: 'Image not found' }, { status: 404 });
	}

	const imagePath = join(process.cwd(), 'user_uploads', 'device', deviceId, imageId + '.webp');
	if (!existsSync(imagePath)) {
		return json({ error: 'Image not found' }, { status: 404 });
	}

	const imageBuffer = await readFile(imagePath);
	return new Response(imageBuffer, {
		headers: {
			'Content-Type': 'image/webp',
			'Content-Length': imageBuffer.length.toString(),
			'Cache-Control': 'private, max-age=31536000, immutable'
		}
	});
}
