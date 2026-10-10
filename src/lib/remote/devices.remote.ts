import { error } from '@sveltejs/kit';
import { command, form, getRequestEvent } from '$app/server';

import { MEDIA_PATH } from '$app/env/private';

import { editDeviceSchema, newDeviceSchema } from '#lib/schema/device.js';
import { db } from '#lib/server/db/index.js';
import { device, deviceSpecification } from '#lib/server/db/schema.js';

import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { and, eq } from 'drizzle-orm';

import sharp from 'sharp';
import z from 'zod';

export const createDevice = form(newDeviceSchema, async ({ name, description, specs, images }) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    return error(401, 'Not logged in');
  }

  const deviceObj = await db.transaction(async (tx) => {
    // create device now, id needed for inserting images
    const deviceObjs = await tx.insert(device).values({ userId, name, description }).returning();

    const createdDevice = deviceObjs[0];
    if (!createdDevice) {
      throw Error('Device is missing');
    }

    // insert spec values
    for (const [i, spec] of specs.entries()) {
      if (!spec.valueId) {
        continue;
      }

      await tx.insert(deviceSpecification).values({
        deviceId: createdDevice.id,
        fieldId: spec.fieldId,
        valueId: spec.valueId,
        position: i
      });
    }

    const imageIds = [];
    const uploadDir = join(MEDIA_PATH, 'device', createdDevice.id.toString());
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
        await tx.update(device).set({ images: imageIds }).where(eq(device.id, createdDevice.id));
      }
    } catch (error) {
      try {
        await rm(uploadDir, { recursive: true, force: true });
      } catch (cleanError) {
        console.error('Failed to clean up upload dir after upload error', cleanError);
      }
      throw error;
    }

    return createdDevice;
  });

  return { success: true, id: deviceObj.id };
});

export const editDevice = form(
  editDeviceSchema,
  async ({ id, name, description, specs, images, existingImages }) => {
    const event = getRequestEvent();
    const userId = event.locals.user?.id;

    if (!userId) {
      error(401, 'Not logged in');
    }

    const deviceObj = await db.transaction(async (tx) => {
      const deviceData = await db.query.device.findFirst({
        where: (device, { and, eq }) => and(eq(device.id, id), eq(device.userId, userId)),
        with: {
          specifications: {
            with: {
              field: true,
              value: true
            }
          }
        }
      });

      if (!deviceData) {
        return error(404, 'Device not found');
      }

      await tx.update(device).set({ name, description }).where(eq(device.id, deviceData.id));

      // replcae old spec values
      await tx.delete(deviceSpecification).where(eq(deviceSpecification.deviceId, deviceData.id));
      for (const [i, spec] of specs.entries()) {
        if (!spec.valueId) {
          continue;
        }

        await tx.insert(deviceSpecification).values({
          deviceId: deviceData.id,
          fieldId: spec.fieldId,
          valueId: spec.valueId,
          position: i
        });
      }

      let imageIds = [];
      const uploadDir = join(MEDIA_PATH, 'device', deviceData.id.toString());

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

        // see which old images were removed
        const maintainedImages = [];
        for (const oldImage of deviceData.images) {
          if (existingImages.includes(oldImage)) {
            maintainedImages.push(oldImage);
            continue;
          }
          await rm(join(uploadDir, oldImage + '.webp'), { force: true });
        }

        imageIds = maintainedImages.concat(imageIds);
        await tx.update(device).set({ images: imageIds }).where(eq(device.id, deviceData.id));
      } catch (error) {
        try {
          await rm(uploadDir, { recursive: true, force: true });
        } catch (cleanError) {
          console.error('Failed to clean up upload dir after upload error', cleanError);
        }
        throw error;
      }

      return deviceData;
    });

    return { success: true, id: deviceObj.id };
  }
);

export const deleteDevice = command(z.uuid(), async (id) => {
  const event = getRequestEvent();
  const userId = event.locals.user?.id;
  if (!userId) {
    error(401, 'Not logged in');
  }

  await db.transaction(async (tx) => {
    const oldDevice = await tx
      .delete(device)
      .where(and(eq(device.id, id), eq(device.userId, userId)))
      .returning();
    if (oldDevice.length === 0) {
      return error(404, 'Device not found');
    }

    const uploadDir = join(MEDIA_PATH, 'device', oldDevice[0].id.toString());
    await rm(uploadDir, { recursive: true, force: true });
  });

  return { success: true };
});
