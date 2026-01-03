import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices, shares } from '$lib/server/db/schema';
import { generateShareId } from '$lib';

export async function POST(event) {
  // Check if the user is authenticated
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.suspended) {
    return json({ error: 'Account is suspended' }, { status: 403 });
  }

  // Get data
  const { type, deviceID } = await event.request.json();

  if (type === undefined || type === null) {
    return json({ error: 'Share type is required' }, { status: 400 });
  }

  const typeInt = parseInt(type, 10);
  if (isNaN(typeInt) || typeInt < 0 || typeInt > 2) {
    return json({ error: 'Invalid share type' }, { status: 400 });
  }

  if (typeInt === 0) {
    // Share all devices
    try {
      const shareId = await generateShareId();

      const share = await db
        .insert(shares)
        .values({
          id: shareId,
          userId: session.user.id,
          type: typeInt,
          sharedDevice: null,
          sharedTags: null
        })
        .returning();

      return json({ share: share[0] });
    } catch (error) {
      console.error('Error creating share:', error);
      return json({ error: 'Failed to create share' }, { status: 500 });
    }
  } else if (typeInt === 1) {
    // Currently inimplemented
    return json({ error: 'Sharing tags is not implemented yet' }, { status: 501 });
  } else if (typeInt === 2) {
    // Share specific device
    if (!deviceID) {
      return json({ error: 'Device ID is required' }, { status: 400 });
    }

    // Validate deviceID
    const deviceIDInt = parseInt(deviceID, 10);

    if (isNaN(deviceIDInt)) {
      return json({ error: 'Invalid device ID' }, { status: 400 });
    }

    // Check if user owns the device
    const device = await db
      .select()
      .from(userDevices)
      .where(and(eq(userDevices.id, deviceIDInt), eq(userDevices.userId, session.user.id)))
      .limit(1);
    if (device.length === 0) {
      return json({ error: 'Device not found' }, { status: 404 });
    }

    try {
      const shareId = await generateShareId();

      const share = await db
        .insert(shares)
        .values({
          id: shareId,
          userId: session.user.id,
          type: typeInt,
          sharedDevice: deviceIDInt,
          sharedTags: null
        })
        .returning();

      return json({ share: share[0] });
    } catch (error) {
      console.error('Error creating share:', error);
      return json({ error: 'Failed to create share' }, { status: 500 });
    }
  } else {
    return json({ error: 'Invalid share type' }, { status: 400 });
  }
}
