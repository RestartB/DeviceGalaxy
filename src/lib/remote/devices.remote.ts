import { error } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';

import { env } from '$env/dynamic/private';

import { deviceSchema } from '$lib/schema/device';
import { db } from '$lib/server/db';
import { device, deviceSpecification } from '$lib/server/db/schema';

import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { eq } from 'drizzle-orm';

import sharp from 'sharp';

export const createDevice = form(deviceSchema, async ({ name, description, specs, images }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  let deviceObj;
  await db.transaction(async (tx) => {
    // make type checker happy
    if (!event.locals.user) {
      return error(401, 'Not logged in');
    }

    // create device now, id needed for inserting images
    const deviceObjs = await tx
      .insert(device)
      .values({
        userId: event.locals.user.id,
        name: name,
        description: description
      })
      .returning();
    deviceObj = deviceObjs[0];

    // insert spec values
    for (const [i, spec] of specs.entries()) {
      if (!spec.valueId) {
        continue;
      }

      await tx.insert(deviceSpecification).values({
        deviceId: deviceObj.id,
        fieldId: spec.fieldId,
        valueId: spec.valueId,
        position: i
      });
    }

    const imageIds = [];
    const uploadDir = join(env.MEDIA_PATH, 'device', deviceObj.id.toString());
    try {
      for (const image of images) {
        await mkdir(uploadDir, { recursive: true });

        // Get unique path for image
        const imageId = crypto.randomUUID();
        const filePath = join(uploadDir, imageId + '.webp');

        // Convert image to buffer
        const imageBuffer = Buffer.from(await image.arrayBuffer());

        // Convert to WebP
        const processedBuffer = await sharp(imageBuffer)
          .webp({
            quality: 85,
            effort: 4
          })
          .rotate()
          .toBuffer();

        // Save processed image
        await writeFile(filePath, processedBuffer);
        imageIds.push(imageId);
      }

      if (imageIds.length > 0) {
        await tx.update(device).set({ images: imageIds }).where(eq(device.id, deviceObj.id));
      }
    } catch (error) {
      try {
        await rm(uploadDir, { recursive: true, force: true });
      } catch (cleanError) {
        console.error('Failed to clean up upload dir after upload error', cleanError);
      }
      throw error;
    }
  });

  if (deviceObj) {
    return { success: true, id: deviceObj.id };
  } else {
    throw Error('Device is missing');
  }
});
