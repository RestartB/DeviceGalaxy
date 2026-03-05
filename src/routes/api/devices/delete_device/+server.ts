import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import {
  userDevices,
  cpus,
  gpus,
  memory,
  storage,
  os,
  brands,
  lastActionTimes
} from '$lib/server/db/schema';

import deleteOrphans from '$lib/deleteOrphans';

import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';

import { env } from '$env/dynamic/private';

export async function DELETE({ locals, url }) {
  // Check if the user is authenticated
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get last deleted time
  const lastDeletedTime = await db
    .select({ lastDeletedTime: lastActionTimes.lastDeletedTime })
    .from(lastActionTimes)
    .where(eq(lastActionTimes.userId, locals.user.id))
    .get();

  if (lastDeletedTime && lastDeletedTime.lastDeletedTime) {
    const lastDeleted = new Date(lastDeletedTime.lastDeletedTime);
    const currentTime = new Date();

    // 10 second cooldown
    if (currentTime.getTime() - lastDeleted.getTime() < 10000) {
      return json(
        { error: 'Slow down! Please wait a few seconds before deleting a device.' },
        { status: 429 }
      );
    }

    // Update last deleted time
    await db
      .update(lastActionTimes)
      .set({ lastDeletedTime: currentTime })
      .where(eq(lastActionTimes.userId, locals.user.id));
  } else {
    await db.insert(lastActionTimes).values({ userId: locals.user.id }).onConflictDoNothing();
  }

  const deviceId = url.searchParams.get('id');
  if (!deviceId) {
    return json({ message: 'Device ID is required' }, { status: 400 });
  }

  try {
    const device = await db
      .select()
      .from(userDevices)
      .where(and(eq(userDevices.id, parseInt(deviceId)), eq(userDevices.userId, locals.user.id)))
      .get();

    if (!device) {
      return json({ error: 'Device not found' }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      await tx.delete(userDevices).where(eq(userDevices.id, parseInt(deviceId)));

      // Check if any other devices exist for each parameter
      if (device.cpu !== null && device.cpu !== undefined) {
        await deleteOrphans(tx, cpus, device.cpu, locals.user.id, 'cpu');
      }

      if (device.gpu !== null && device.gpu !== undefined) {
        await deleteOrphans(tx, gpus, device.gpu, locals.user.id, 'gpu');
      }

      if (device.memory !== null && device.memory !== undefined) {
        await deleteOrphans(tx, memory, device.memory, locals.user.id, 'memory');
      }

      if (device.storage !== null && device.storage !== undefined) {
        await deleteOrphans(tx, storage, device.storage, locals.user.id, 'storage');
      }

      if (device.os !== null && device.os !== undefined) {
        await deleteOrphans(tx, os, device.os, locals.user.id, 'os');
      }

      if (device.brand !== null && device.brand !== undefined) {
        await deleteOrphans(tx, brands, device.brand, locals.user.id, 'brand');
      }

      // Delete device's image folder
      const deviceImagePath = join(env.DATA_PATH, 'device', deviceId.toString());
      if (existsSync(deviceImagePath)) {
        await rm(deviceImagePath, { recursive: true });
      }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return json({ error: 'Failed to delete device' }, { status: 500 });
  }
}
