import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices } from '$lib/server/db/schema';

export async function GET(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
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

	const device = await db
		.select()
		.from(userDevices)
		.where(and(eq(userDevices.id, parseInt(deviceId)), eq(userDevices.userId, session.user.id)))
		.get();

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
