import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod/v4';
import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userDevices } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';

const schema = z.object({
    deviceName: z.string(),
    description: z.string().optional(),
    cpu: z.string().optional(),
    memory: z.string().optional(),
    storage: z.string().optional(),
    os: z.string().optional(),
    brand: z.string().optional(),
});

export const load = async () => {
    const form = await superValidate(zod4(schema));
    return { form };
};

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod4(schema));
        // Check if the user is authenticated
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!form.valid) {
            return fail(400, { form });
        }

        if (!session || !session.user) {
            return fail(401, { form });
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
                createdAt: new Date(),
            });

            return message(form, 'Device added successfully!');
        } catch (error) {
            console.error('Error adding device:', error);
            return fail(500, { form });
        }
    }
};