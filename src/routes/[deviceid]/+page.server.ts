import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
  userDevices,
  cpus,
  gpus,
  memory,
  storage,
  os,
  brands,
  tags,
  shares,
  user
} from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const load = async (event) => {
  const hostname = event.url.hostname;

  const baseDomain = PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');

  if (!subdomain) {
    return redirect(
      307,
      event.url
        .toString()
        .replace('www.', '')
        .replace(subdomain + '.', '')
    );
  }

  // Get device ID
  const deviceID = parseInt(event.params.deviceid);
  if (isNaN(deviceID)) {
    return error(404, 'Device not found');
  }

  // Check if subdomain exists
  const subdomainUser = await db
    .select({ id: user.id, name: user.name, description: user.description, image: user.image })
    .from(user)
    .where(eq(user.subdomain, subdomain))
    .get();

  if (!subdomainUser) {
    return error(404, 'Share not found');
  }

  // Get share info
  const share = await db
    .select()
    .from(shares)
    .where(and(eq(shares.userId, subdomainUser.id), eq(shares.internal, true)))
    .get();

  if (share === undefined) {
    return error(404, 'Share not found');
  }

  const device = await db
    .select()
    .from(userDevices)
    .where(and(eq(userDevices.id, deviceID), eq(userDevices.userId, share.userId)))
    .get();

  if (!device) {
    return error(404, 'Device not found');
  }

  const cpuData = await db
    .select({ id: cpus.id, value: cpus.value, displayName: cpus.displayName })
    .from(cpus)
    .where(eq(cpus.id, device.cpu as number));

  const gpuData = await db
    .select({ id: gpus.id, value: gpus.value, displayName: gpus.displayName })
    .from(gpus)
    .where(eq(gpus.id, device.gpu as number));

  const memoryData = await db
    .select({ id: memory.id, value: memory.value, displayName: memory.displayName })
    .from(memory)
    .where(eq(memory.id, device.memory as number));

  const storageData = await db
    .select({ id: storage.id, value: storage.value, displayName: storage.displayName })
    .from(storage)
    .where(eq(storage.id, device.storage as number));

  const osData = await db
    .select({ id: os.id, value: os.value, displayName: os.displayName })
    .from(os)
    .where(eq(os.id, device.os as number));

  const brandData = await db
    .select({ id: brands.id, value: brands.value, displayName: brands.displayName })
    .from(brands)
    .where(eq(brands.id, device.brand as number));

  const tagData = await db
    .select({
      id: tags.id,
      tagName: tags.tagName,
      tagColour: tags.tagColour,
      tagTextColour: tags.tagTextColour
    })
    .from(tags);

  const deviceTags = (device.tags || [])
    .map((tagId: number) => tagData.find((tag) => tag.id === tagId))
    .filter(Boolean);

  const processedDevice = {
    ...device,
    cpu: cpuData[0]?.displayName ?? null,
    gpu: gpuData[0]?.displayName ?? null,
    memory: memoryData[0]?.displayName ?? null,
    storage: storageData[0]?.displayName ?? null,
    os: osData[0]?.displayName ?? null,
    brand: brandData[0]?.displayName ?? null,
    tags: deviceTags
  };

  return {
    share,
    shareUser: subdomainUser,
    baseURL: event.url.origin,
    device: processedDevice
  };
};
