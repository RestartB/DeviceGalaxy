import type { PageServerLoad } from '../$types';

import { db } from '$lib/server/db';
import { userDevices, cpus, memory, storage, os, brands, tags } from '$lib/server/db/schema';
import { eq, count, desc } from 'drizzle-orm';

import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newDeviceSchema } from '$lib/schema/newDevice';
import { newTagSchema } from '$lib/schema/newTag';

export const load: PageServerLoad = async ({ parent }) => {
  const { session, user } = await parent();

  const newDeviceForm = await superValidate(zod4(newDeviceSchema));
  const newTagForm = await superValidate(zod4(newTagSchema));

  if (!session || !user) {
    return {
      devices: [],
      totalCount: 0,
      randomGreeting: '',
      attributeLists: {
        cpus: [],
        memory: [],
        storage: [],
        os: [],
        brands: []
      },
      tags: [],
      newDeviceForm,
      newTagForm
    };
  }

  // Fetch attributes for devices
  const cpuData = await db.select().from(cpus).where(eq(cpus.userID, user.id));

  const memoryData = await db.select().from(memory).where(eq(memory.userID, user.id));

  const storageData = await db.select().from(storage).where(eq(storage.userID, user.id));

  const osData = await db.select().from(os).where(eq(os.userID, user.id));

  const brandData = await db.select().from(brands).where(eq(brands.userId, user.id));

  const tagData = await db.select().from(tags).where(eq(tags.userId, user.id));

  const createdAtDevices = await db
    .select()
    .from(userDevices)
    .where(eq(userDevices.userId, user.id))
    .limit(5)
    .orderBy(desc(userDevices.createdAt));

  const createdAtMatchedDevices = createdAtDevices.map((device) => {
    const deviceTagIds = device.tags || [];

    const deviceTags = deviceTagIds
      .map((tagId: number) => tagData.find((tag) => tag.id === tagId))
      .filter(Boolean);

    return {
      ...device,
      cpu: cpuData.find((cpu) => cpu.id === device.cpu)?.displayName,
      memory: memoryData.find((mem) => mem.id === device.memory)?.displayName,
      storage: storageData.find((stor) => stor.id === device.storage)?.displayName,
      os: osData.find((osItem) => osItem.id === device.os)?.displayName,
      brand: brandData.find((brand) => brand.id === device.brand)?.displayName,
      tags: deviceTags
    };
  });

  const updatedAtDevices = await db
    .select()
    .from(userDevices)
    .where(eq(userDevices.userId, user.id))
    .limit(5)
    .orderBy(desc(userDevices.updatedAt));

  const updatedAtMatchedDevices = updatedAtDevices.map((device) => {
    const deviceTagIds = device.tags || [];

    const deviceTags = deviceTagIds
      .map((tagId: number) => tagData.find((tag) => tag.id === tagId))
      .filter(Boolean);

    return {
      ...device,
      cpu: cpuData.find((cpu) => cpu.id === device.cpu)?.displayName,
      memory: memoryData.find((mem) => mem.id === device.memory)?.displayName,
      storage: storageData.find((stor) => stor.id === device.storage)?.displayName,
      os: osData.find((osItem) => osItem.id === device.os)?.displayName,
      brand: brandData.find((brand) => brand.id === device.brand)?.displayName,
      tags: deviceTags
    };
  });

  // Get total count of devices for pagination
  const totalCount = await db
    .select({ count: count() })
    .from(userDevices)
    .where(eq(userDevices.userId, user.id));

  const greetings = [
    'Welcome back,',
    'Hi,',
    'Hello,',
    'Good to see you,',
    'Greetings,',
    'Hey there,',
    "What's up,",
    'Haii,'
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return {
    recentlyCreated: createdAtMatchedDevices,
    recentlyUpdated: updatedAtMatchedDevices,
    attributeLists: {
      cpus: cpuData,
      memory: memoryData,
      storage: storageData,
      os: osData,
      brands: brandData
    },
    tags: tagData,
    totalCount: totalCount[0].count,
    randomGreeting,
    newDeviceForm,
    newTagForm
  };
};
