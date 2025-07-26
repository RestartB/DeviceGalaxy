import { error } from '@sveltejs/kit';
import { DEVICE_LIMIT } from '$env/static/private';

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newDeviceSchema } from '$lib/schema/newDevice';
import { editDeviceSchema } from '$lib/schema/editDevice';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { eq, and, count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
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
import { verifyTurnstile } from '$lib';

import sharp from 'sharp';
import { existsSync } from 'fs';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const load = async () => {
  const newDeviceForm = await superValidate(zod4(newDeviceSchema));
  const editDeviceForm = await superValidate(zod4(editDeviceSchema));
  const newTagForm = await superValidate(zod4(newTagSchema));

  return { newDeviceForm, editDeviceForm, newTagForm };
};

export const actions = {
  newDevice: async ({ request }) => {
    const formData = await request.formData();

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    // Get last created time
    const lastCreatedTime = await db
      .select({ lastCreatedTime: lastActionTimes.lastCreatedTime })
      .from(lastActionTimes)
      .where(eq(lastActionTimes.userId, session.user.id))
      .get();

    if (lastCreatedTime && lastCreatedTime.lastCreatedTime) {
      const lastCreated = new Date(lastCreatedTime.lastCreatedTime);
      const currentTime = new Date();

      // 10 second cooldown
      if (currentTime.getTime() - lastCreated.getTime() < 10000) {
        return error(429, 'Slow down! Please wait a few seconds before creating another device.');
      }

      // Update last created time
      await db
        .update(lastActionTimes)
        .set({ lastCreatedTime: currentTime })
        .where(eq(lastActionTimes.userId, session.user.id));
    } else {
      await db.insert(lastActionTimes).values({ userId: session.user.id }).onConflictDoNothing();
    }

    const form = await superValidate(formData, zod4(newDeviceSchema));

    if (!form.valid) {
      return error(400, 'Invalid form');
    }

    if (form.data['cf-turnstile-response']) {
      // Verify Turnstile token
      const isValid = await verifyTurnstile(
        form.data['cf-turnstile-response'],
        request.headers.get('cf-connecting-ip') || ''
      );
      if (!isValid) {
        return error(400, 'Invalid Turnstile token. Please try again.');
      }
    } else {
      return error(400, 'Turnstile token is required.');
    }

    // Check device limit
    const deviceCount = await db
      .select({ count: count() })
      .from(userDevices)
      .where(eq(userDevices.userId, session.user.id))
      .get();

    if (deviceCount && deviceCount.count >= parseInt(DEVICE_LIMIT)) {
      return error(403, `Device limit reached. You can only have up to ${DEVICE_LIMIT} devices.`);
    }

    // Check that all provided tags exist
    if (form.data.tags && form.data.tags.length > 0) {
      const existingTags = await db.query.tags.findMany({
        where: eq(userDevices.userId, session.user.id)
      });
      const tagValues = existingTags.map((tag) => tag.id);
      const invalidTags = form.data.tags.filter((tag) => !tagValues.includes(tag));
      if (invalidTags.length > 0) {
        return error(
          400,
          "Some provided tags don't exist. Please try refreshing the devices list."
        );
      }
    }

    try {
      let newCPU: InferSelectModel<typeof cpus> | undefined;
      let newGPU: InferSelectModel<typeof gpus> | undefined;
      let newMemory: InferSelectModel<typeof memory> | undefined;
      let newStorage: InferSelectModel<typeof storage> | undefined;
      let newOS: InferSelectModel<typeof os> | undefined;
      let newBrand: InferSelectModel<typeof brands> | undefined;

      await db.transaction(async (tx) => {
        // CPU
        if (form.data.cpu) {
          const cpuValue = form.data.cpu.trim().toLowerCase();
          const existingCpu = await tx.query.cpus.findFirst({
            where: and(eq(cpus.value, cpuValue), eq(cpus.userID, session.user.id))
          });

          if (!existingCpu) {
            // Insert into table, get the ID
            newCPU = await tx
              .insert(cpus)
              .values({
                userID: session.user.id,
                value: cpuValue,
                displayName: form.data.cpu
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newCPU = existingCpu;
          }
        }

        // GPU
        if (form.data.gpu) {
          const gpuValue = form.data.gpu.trim().toLowerCase();
          const existingGpu = await tx.query.gpus.findFirst({
            where: and(eq(gpus.value, gpuValue), eq(gpus.userID, session.user.id))
          });

          if (!existingGpu) {
            // Insert into table, get the ID
            newGPU = await tx
              .insert(gpus)
              .values({
                userID: session.user.id,
                value: gpuValue,
                displayName: form.data.gpu
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newGPU = existingGpu;
          }
        }

        // Memory
        if (form.data.memory) {
          const memoryValue = form.data.memory.trim().toLowerCase();
          const existingMemory = await tx.query.memory.findFirst({
            where: and(eq(memory.value, memoryValue), eq(memory.userID, session.user.id))
          });

          if (!existingMemory) {
            // Insert into table, get the ID
            newMemory = await tx
              .insert(memory)
              .values({
                userID: session.user.id,
                value: memoryValue,
                displayName: form.data.memory
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newMemory = existingMemory;
          }
        }

        // Storage
        if (form.data.storage) {
          const storageValue = form.data.storage.trim().toLowerCase();
          const existingStorage = await tx.query.storage.findFirst({
            where: and(eq(storage.value, storageValue), eq(storage.userID, session.user.id))
          });

          if (!existingStorage) {
            // Insert into table, get the ID
            newStorage = await tx
              .insert(storage)
              .values({
                userID: session.user.id,
                value: storageValue,
                displayName: form.data.storage
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newStorage = existingStorage;
          }
        }

        // OS
        if (form.data.os) {
          const osValue = form.data.os.trim().toLowerCase();
          const existingOS = await tx.query.os.findFirst({
            where: and(eq(os.value, osValue), eq(os.userID, session.user.id))
          });

          if (!existingOS) {
            // Insert into table, get the ID
            newOS = await tx
              .insert(os)
              .values({
                userID: session.user.id,
                value: osValue,
                displayName: form.data.os
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newOS = existingOS;
          }
        }

        // Brand
        if (form.data.brand) {
          const brandValue = form.data.brand.trim().toLowerCase();
          const existingBrand = await tx.query.brands.findFirst({
            where: and(eq(brands.value, brandValue), eq(brands.userId, session.user.id))
          });

          if (!existingBrand) {
            // Insert into table, get the ID
            newBrand = await tx
              .insert(brands)
              .values({
                userId: session.user.id,
                value: brandValue,
                displayName: form.data.brand
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newBrand = existingBrand;
          }
        }

        // Insert the device with the authenticated user's ID, get ID
        const insertedRows = await tx
          .insert(userDevices)
          .values({
            userId: session.user.id,
            deviceName: form.data.deviceName,
            description: form.data.description,
            additional: form.data.additional,
            cpu: newCPU?.id,
            gpu: newGPU?.id,
            memory: newMemory?.id,
            storage: newStorage?.id,
            os: newOS?.id,
            brand: newBrand?.id,
            externalImages: form.data.imageURLs,
            tags: form.data.tags,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

        const deviceID = insertedRows[0].id;

        // Images
        const processedImages: string[] = [];
        if (form.data.images && form.data.images.length > 0) {
          for (const image of form.data.images) {
            const uploadDir = join(process.cwd(), 'user_uploads', 'device', deviceID.toString());
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

            processedImages.push(imageId);
          }
        }

        // Add images to device
        await tx
          .update(userDevices)
          .set({
            internalImages: processedImages
          })
          .where(eq(userDevices.id, deviceID));
      });

      return message(form, 'Device added successfully!');
    } catch (err) {
      console.error('Error adding device:', err);
      return error(500, 'Error adding device');
    }
  },
  editDevice: async ({ request }) => {
    const formData = await request.formData();

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    // Get last updated time
    const lastUpdatedTime = await db
      .select({ lastUpdatedTime: lastActionTimes.lastUpdatedTime })
      .from(lastActionTimes)
      .where(eq(lastActionTimes.userId, session.user.id))
      .get();

    if (lastUpdatedTime && lastUpdatedTime.lastUpdatedTime) {
      const lastUpdated = new Date(lastUpdatedTime.lastUpdatedTime);
      const currentTime = new Date();

      // 10 second cooldown
      if (currentTime.getTime() - lastUpdated.getTime() < 10000) {
        return error(429, 'Slow down! Please wait a few seconds before updating a device.');
      }

      // Update last updated time
      await db
        .update(lastActionTimes)
        .set({ lastUpdatedTime: currentTime })
        .where(eq(lastActionTimes.userId, session.user.id));
    } else {
      await db.insert(lastActionTimes).values({ userId: session.user.id }).onConflictDoNothing();
    }

    const form = await superValidate(formData, zod4(editDeviceSchema));

    if (!form.valid) {
      return error(400, 'Invalid form');
    }

    if (form.data['cf-turnstile-response']) {
      // Verify Turnstile token
      const isValid = await verifyTurnstile(
        form.data['cf-turnstile-response'],
        request.headers.get('cf-connecting-ip') || ''
      );
      if (!isValid) {
        return error(400, 'Invalid Turnstile token. Please try again.');
      }
    } else {
      return error(400, 'Turnstile token is required.');
    }

    try {
      let newCPU: InferSelectModel<typeof cpus> | undefined;
      let newGPU: InferSelectModel<typeof gpus> | undefined;
      let newMemory: InferSelectModel<typeof memory> | undefined;
      let newStorage: InferSelectModel<typeof storage> | undefined;
      let newOS: InferSelectModel<typeof os> | undefined;
      let newBrand: InferSelectModel<typeof brands> | undefined;

      const existingDevice = await db
        .select()
        .from(userDevices)
        .where(and(eq(userDevices.id, parseInt(form.id)), eq(userDevices.userId, session.user.id)))
        .get();

      if (!existingDevice) {
        return error(404, 'Device not found');
      }

      // Check that all provided tags exist
      if (form.data.tags && form.data.tags.length > 0) {
        const existingTags = await db.query.tags.findMany({
          where: eq(userDevices.userId, session.user.id)
        });
        const tagValues = existingTags.map((tag) => tag.id);
        const invalidTags = form.data.tags.filter((tag) => !tagValues.includes(tag));
        if (invalidTags.length > 0) {
          return error(
            400,
            "Some provided tags don't exist. Please try refreshing the devices list."
          );
        }
      }

      await db.transaction(async (tx) => {
        // CPU
        if (form.data.cpu) {
          const cpuValue = form.data.cpu.trim().toLowerCase();
          const existingCpu = await tx.query.cpus.findFirst({
            where: and(eq(cpus.value, cpuValue), eq(cpus.userID, session.user.id))
          });

          if (!existingCpu) {
            // Insert into table, get the ID
            newCPU = await tx
              .insert(cpus)
              .values({
                userID: session.user.id,
                value: cpuValue,
                displayName: form.data.cpu
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newCPU = existingCpu;
          }
        }

        // GPU
        if (form.data.gpu) {
          const gpuValue = form.data.gpu.trim().toLowerCase();
          const existingGpu = await tx.query.gpus.findFirst({
            where: and(eq(gpus.value, gpuValue), eq(gpus.userID, session.user.id))
          });

          if (!existingGpu) {
            // Insert into table, get the ID
            newGPU = await tx
              .insert(gpus)
              .values({
                userID: session.user.id,
                value: gpuValue,
                displayName: form.data.gpu
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newGPU = existingGpu;
          }
        }

        // Memory
        if (form.data.memory) {
          const memoryValue = form.data.memory.trim().toLowerCase();
          const existingMemory = await tx.query.memory.findFirst({
            where: and(eq(memory.value, memoryValue), eq(memory.userID, session.user.id))
          });

          if (!existingMemory) {
            // Insert into table, get the ID
            newMemory = await tx
              .insert(memory)
              .values({
                userID: session.user.id,
                value: memoryValue,
                displayName: form.data.memory
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newMemory = existingMemory;
          }
        }

        // Storage
        if (form.data.storage) {
          const storageValue = form.data.storage.trim().toLowerCase();
          const existingStorage = await tx.query.storage.findFirst({
            where: and(eq(storage.value, storageValue), eq(storage.userID, session.user.id))
          });

          if (!existingStorage) {
            // Insert into table, get the ID
            newStorage = await tx
              .insert(storage)
              .values({
                userID: session.user.id,
                value: storageValue,
                displayName: form.data.storage
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newStorage = existingStorage;
          }
        }

        // OS
        if (form.data.os) {
          const osValue = form.data.os.trim().toLowerCase();
          const existingOS = await tx.query.os.findFirst({
            where: and(eq(os.value, osValue), eq(os.userID, session.user.id))
          });

          if (!existingOS) {
            // Insert into table, get the ID
            newOS = await tx
              .insert(os)
              .values({
                userID: session.user.id,
                value: osValue,
                displayName: form.data.os
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newOS = existingOS;
          }
        }

        // Brand
        if (form.data.brand) {
          const brandValue = form.data.brand.trim().toLowerCase();
          const existingBrand = await tx.query.brands.findFirst({
            where: and(eq(brands.value, brandValue), eq(brands.userId, session.user.id))
          });

          if (!existingBrand) {
            // Insert into table, get the ID
            newBrand = await tx
              .insert(brands)
              .values({
                userId: session.user.id,
                value: brandValue,
                displayName: form.data.brand
              })
              .returning()
              .then((rows) => rows[0]);
          } else {
            newBrand = existingBrand;
          }
        }

        const processedImages = form.data.oldImages || [];

        // Compare and delete images that are not in the new list
        if (form.data.oldImages && form.data.oldImages.length > 0) {
          const existingImages = existingDevice.internalImages || [];
          const imagesToDelete = existingImages.filter(
            (image) => !form.data.oldImages?.includes(image)
          );

          if (imagesToDelete.length > 0) {
            for (const imageId of imagesToDelete) {
              const imagePath = join(
                process.cwd(),
                'user_uploads',
                'device',
                existingDevice.id.toString(),
                imageId + '.webp'
              );
              try {
                if (existsSync(imagePath)) {
                  await unlink(imagePath);
                }
              } catch (err) {
                console.error(`Error deleting image ${imageId}:`, err);
              }
            }
          }
        }

        // Upload new images
        if (form.data.newImages && form.data.newImages.length > 0) {
          for (const image of form.data.newImages) {
            const uploadDir = join(
              process.cwd(),
              'user_uploads',
              'device',
              existingDevice.id.toString()
            );
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

            processedImages.push(imageId);
          }
        }

        // Insert the device
        await tx
          .update(userDevices)
          .set({
            deviceName: form.data.deviceName,
            description: form.data.description,
            additional: form.data.additional,
            cpu: newCPU?.id,
            gpu: newGPU?.id,
            memory: newMemory?.id,
            storage: newStorage?.id,
            os: newOS?.id,
            brand: newBrand?.id,
            internalImages: processedImages,
            externalImages: form.data.imageURLs,
            tags: form.data.tags,
            updatedAt: new Date()
          })
          .where(eq(userDevices.id, parseInt(form.id)));

        // Delete orphans
        if (existingDevice.cpu !== null && existingDevice.cpu !== undefined) {
          await deleteOrphans(tx, cpus, existingDevice.cpu, session.user.id, 'cpu');
        }

        if (existingDevice.gpu !== null && existingDevice.gpu !== undefined) {
          await deleteOrphans(tx, gpus, existingDevice.gpu, session.user.id, 'gpu');
        }

        if (existingDevice.memory !== null && existingDevice.memory !== undefined) {
          await deleteOrphans(tx, memory, existingDevice.memory, session.user.id, 'memory');
        }

        if (existingDevice.storage !== null && existingDevice.storage !== undefined) {
          await deleteOrphans(tx, storage, existingDevice.storage, session.user.id, 'storage');
        }

        if (existingDevice.os !== null && existingDevice.os !== undefined) {
          await deleteOrphans(tx, os, existingDevice.os, session.user.id, 'os');
        }

        if (existingDevice.brand !== null && existingDevice.brand !== undefined) {
          await deleteOrphans(tx, brands, existingDevice.brand, session.user.id, 'brand');
        }
      });

      return message(form, 'Device updated successfully!');
    } catch (err) {
      console.error('Error updating device:', err);
      return error(500, 'Error updating device');
    }
  }
};
