import { error } from '@sveltejs/kit';

import { MEDIA_PATH } from '$app/env/private';

import { db } from '#lib/server/db/index.js';
import { device } from '#lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

import { join } from 'path';
import { readFile } from 'fs/promises';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) {
    return error(401, 'Not signed in');
  }

  const deviceData = await db
    .select()
    .from(device)
    .where(and(eq(device.userId, user.id), eq(device.id, params.deviceID)));

  if (deviceData.length === 0) {
    return error(404, 'Device not found');
  }
  if (!deviceData[0].images.includes(params.imageID)) {
    return error(404, 'Image not found');
  }

  let imageBuffer;
  try {
    const imagePath = join(MEDIA_PATH, 'device', params.deviceID, params.imageID + '.webp');
    imageBuffer = await readFile(imagePath);
  } catch (cause) {
    if (cause instanceof Error && 'code' in cause && cause.code === 'ENOENT') {
      error(404, 'Image not found');
    }

    throw cause;
  }

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'private, max-age=31536000, immutable'
    }
  });
};
