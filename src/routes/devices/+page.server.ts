import { superValidate, message } from 'sveltekit-superforms';
import { error } from '@sveltejs/kit';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { userDevices } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { schema } from './schema';


export const load = async () => {
	const form = await superValidate(zod4(schema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
            return error(400, "Invalid form");
        }

		try {
			// Insert the device with the authenticated user's ID
			await db.insert(userDevices).values({
				userId: session.user.id,
				deviceName: form.data.deviceName,
				description: form.data.description,
				cpu: form.data.cpu,
				memory: form.data.memory,
				storage: form.data.storage,
				os: form.data.os,
				brand: form.data.brand,
				createdAt: new Date()
			});

			return message(form, 'Device added successfully!');
		} catch (err) {
			console.error('Error adding device:', err);
			return error(500, "Error adding device");
		}
	}
};
