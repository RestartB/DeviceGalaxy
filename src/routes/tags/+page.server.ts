import { error } from '@sveltejs/kit';

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { tags } from '$lib/server/db/schema';

// thank you https://stackoverflow.com/a/41491220
function colorIsDarkSimple(bgColor: string) {
	const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
	const r = parseInt(color.substring(0, 2), 16); // hexToR
	const g = parseInt(color.substring(2, 4), 16); // hexToG
	const b = parseInt(color.substring(4, 6), 16); // hexToB
	return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
}

export const load = async () => {
	const newTagForm = await superValidate(zod4(newTagSchema));
	const editTagForm = await superValidate(zod4(newTagSchema));

	return { newTagForm, editTagForm };
};

export const actions = {
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
	},
	editTag: async ({ request }) => {
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

		try {
			const existingTag = await db
				.select()
				.from(tags)
				.where(and(eq(tags.id, parseInt(form.id)), eq(tags.userId, session.user.id)))
				.get();

			if (!existingTag) {
				return error(404, 'Tag not found');
			}

			await db
				.update(tags)
				.set({
					tagName: form.data.tagName,
					tagColour: (form.data.colourEnabled && form.data.colour) || null,
					tagTextColour:
						form.data.colourEnabled && form.data.colour
							? colorIsDarkSimple(form.data.colour)
								? '#FFFFFF'
								: '#000000'
							: null,
					updatedAt: new Date()
				})
				.where(eq(tags.id, parseInt(form.id)));

			return message(form, 'Tag updated successfully!');
		} catch (err) {
			console.error('Error updating tag:', err);
			return error(500, 'Error updating tag');
		}
	}
};
