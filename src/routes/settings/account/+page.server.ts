import { error } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';

import { message } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { profilePictureSchema } from '$lib/schema/profilePicture';

import sharp from 'sharp';
import { existsSync } from 'fs';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

export const load = async () => {
	const profilePictureForm = await superValidate(zod4(profilePictureSchema));

	return { profilePictureForm };
};

export const actions = {
	uploadPFP: async ({ request, url }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(profilePictureSchema));

		if (!form.valid) {
			return error(400, 'Invalid form');
		}

		const oldPFP = session.user.image?.replaceAll(`${url.origin}/public/pfp/`, '');

		// Create PFP folder if it doesn't exist
		try {
			await mkdir(join(process.cwd(), 'static', 'public', 'pfp'), { recursive: true });
		} catch (err) {
			console.error('Error creating PFP directory:', err);
			return error(500, 'Internal Server Error');
		}

		// Generate ID
		let pfpID = '';
		while (!pfpID || existsSync(join(process.cwd(), 'static', 'public', 'pfp', pfpID + '.webp'))) {
			pfpID = `${session.user.id}-${crypto.randomUUID()}`;
		}

		// Convert image to buffer
		const imageBuffer = Buffer.from(await form.data.image.arrayBuffer());

		// Convert to WebP
		const processedBuffer = await sharp(imageBuffer)
			.webp({
				quality: 85,
				effort: 4
			})
			.rotate()
			.resize({
				width: 128,
				height: 128,
				fit: 'cover',
				position: 'center'
			})
			.toBuffer();

		// Save processed image
		await writeFile(
			join(process.cwd(), 'static', 'public', 'pfp', pfpID + '.webp'),
			processedBuffer
		);

		// Update user profile picture URL
		const newPFPUrl = `${url.origin}/public/pfp/${pfpID}.webp`;
		await auth.api.updateUser({
			headers: request.headers,
			body: {
				image: newPFPUrl
			}
		});

		// Delete old profile picture if it exists
		if (oldPFP && existsSync(join(process.cwd(), 'static', 'public', 'pfp', oldPFP))) {
			await unlink(join(process.cwd(), 'static', 'public', 'pfp', oldPFP));
		}

		return message(form, 'Updated');
	},
};
