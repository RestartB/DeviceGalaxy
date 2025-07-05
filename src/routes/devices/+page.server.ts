import { error } from '@sveltejs/kit';

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newDeviceSchema } from '$lib/schema/newDevice';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { InferSelectModel } from 'drizzle-orm';
import { tags, userDevices, cpus, memory, storage, os, brands } from '$lib/server/db/schema';

export const load = async () => {
	const newDeviceForm = await superValidate(zod4(newDeviceSchema));
	const newTagForm = await superValidate(zod4(newTagSchema));
	return { newDeviceForm, newTagForm };
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
					tagIDs: form.data.tagIDs,
					createdAt: new Date()
				});
			});

			return message(form, 'Device added successfully!');
		} catch (err) {
			console.error('Error adding device:', err);
			return error(500, 'Error adding device');
		}
	},
	newTag: async ({ request }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(newTagSchema));

		if (!form.valid) {
			return error(400, 'Invalid form');
		}

		// thank you https://stackoverflow.com/a/41491220
		function colorIsDarkSimple(bgColor: string) {
			const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
			const r = parseInt(color.substring(0, 2), 16); // hexToR
			const g = parseInt(color.substring(2, 4), 16); // hexToG
			const b = parseInt(color.substring(4, 6), 16); // hexToB
			return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
		}

		try {
			await db.insert(tags).values({
				userId: session.user.id,
				tagName: form.data.tagName,
				tagColour: (form.data.colourEnabled && form.data.colour) || null,
				tagTextColour:
					form.data.colourEnabled && form.data.colour
						? colorIsDarkSimple(form.data.colour)
							? '#FFFFFF'
							: '#000000'
						: null,
				createdAt: new Date()
			});

			return message(form, 'Tag created successfully!');
		} catch (err) {
			console.error('Error creating tag:', err);
			return error(500, 'Error creating tag');
		}
	}
};
