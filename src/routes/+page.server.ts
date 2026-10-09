import { desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { device, share, tag } from '#lib/server/db/schema.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return {
      deviceCount: 0,
      tagCount: 0,
      shareCount: 0,
      newDevices: [],
      recentDevices: [],
      recentShared: []
    };
  }

  const deviceCount = await db.$count(device, eq(device.userId, user.id));
  const tagCount = await db.$count(tag, eq(tag.userId, user.id));
  const shareCount = await db.$count(share, eq(share.userId, user.id));

  const newDevices = await db
    .select()
    .from(device)
    .where(eq(device.userId, user.id))
    .orderBy(desc(device.createdAt))
    .limit(8);
  const recentDevices = await db
    .select()
    .from(device)
    .where(eq(device.userId, user.id))
    .orderBy(desc(device.updatedAt))
    .limit(8);

  return { deviceCount, tagCount, shareCount, newDevices, recentDevices, recentShared: [] };
};
