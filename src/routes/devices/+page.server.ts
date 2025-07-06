import { error } from '@sveltejs/kit';

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newDeviceSchema } from '$lib/schema/newDevice';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
import { userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

export const load = async () => {
	const newDeviceForm = await superValidate(zod4(newDeviceSchema));
	const editDeviceForm = await superValidate(zod4(newDeviceSchema));
	const newTagForm = await superValidate(zod4(newTagSchema));

	return { newDeviceForm, editDeviceForm, newTagForm };
};

export const actions = {
	newDevice: async ({ request }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(newDeviceSchema));

		if (!form.valid) {
			return error(400, 'Invalid form');
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

				// Insert the device with the authenticated user's ID
				await tx.insert(userDevices).values({
					userId: session.user.id,
					deviceName: form.data.deviceName,
					description: form.data.description,
					cpu: newCPU?.id,
					memory: newMemory?.id,
					storage: newStorage?.id,
					os: newOS?.id,
					brand: newBrand?.id,
					imageURLs: form.data.imageURLs,
					tags: form.data.tags,
					createdAt: new Date()
				});
			});

			return message(form, 'Device added successfully!');
		} catch (err) {
			console.error('Error adding device:', err);
			return error(500, 'Error adding device');
		}
	},
	editDevice: async ({ request }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(newDeviceSchema));

		if (!form.valid) {
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
						imageURLs: form.data.imageURLs,
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
