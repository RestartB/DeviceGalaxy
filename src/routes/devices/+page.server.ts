import { error } from '@sveltejs/kit';

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newDeviceSchema } from '$lib/schema/newDevice';
import { editDeviceSchema } from '$lib/schema/editDevice';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
import { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

import sharp from 'sharp';
import { existsSync } from 'fs';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

export const load = async () => {
	const newDeviceForm = await superValidate(zod4(newDeviceSchema));
	const editDeviceForm = await superValidate(zod4(editDeviceSchema));
	const newTagForm = await superValidate(zod4(newTagSchema));

	return { newDeviceForm, editDeviceForm, newTagForm };
};

export const actions = {
	newDevice: async ({ request }) => {
		const formData = await request.formData();
		console.log(formData);

		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(formData, zod4(newDeviceSchema));

		if (!form.valid) {
			console.error('Form invalid:', form.errors);
			console.error('Form data:', form.data);
			return error(400, 'Invalid form');
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
			let newMemory: InferSelectModel<typeof memory> | undefined;
			let newStorage: InferSelectModel<typeof storage> | undefined;
			let newOS: InferSelectModel<typeof os> | undefined;
			let newBrand: InferSelectModel<typeof brands> | undefined;

			await db.transaction(async (tx) => {
				// CPU
				if (form.data.cpu) {
					const cpuValue = form.data.cpu.trim().toLowerCase();
					const existingCpu = await tx.query.cpus.findFirst({
						where: eq(cpus.value, cpuValue)
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

				// Memory
				if (form.data.memory) {
					const memoryValue = form.data.memory.trim().toLowerCase();
					const existingMemory = await tx.query.memory.findFirst({
						where: eq(memory.value, memoryValue)
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
						where: eq(storage.value, storageValue)
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
						where: eq(os.value, osValue)
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
						where: eq(brands.value, brandValue)
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
						cpu: newCPU?.id,
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
		console.log(formData);

		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(formData, zod4(editDeviceSchema));

		if (!form.valid) {
			console.error('Form invalid:', form.errors);
			console.error('Form data:', form.data);
			return error(400, 'Invalid form');
		}

		try {
			let newCPU: InferSelectModel<typeof cpus> | undefined;
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
						where: eq(cpus.value, cpuValue)
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

				// Memory
				if (form.data.memory) {
					const memoryValue = form.data.memory.trim().toLowerCase();
					const existingMemory = await tx.query.memory.findFirst({
						where: eq(memory.value, memoryValue)
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
						where: eq(storage.value, storageValue)
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
						where: eq(os.value, osValue)
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
						where: eq(brands.value, brandValue)
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
						cpu: newCPU?.id,
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
			});

			return message(form, 'Device updated successfully!');
		} catch (err) {
			console.error('Error updating device:', err);
			return error(500, 'Error updating device');
		}
	}
};
