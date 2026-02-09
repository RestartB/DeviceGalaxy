import { error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { message, fail } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';

import { updateNameSchema } from '$lib/schema/updateName';
import { updateEmailSchema } from '$lib/schema/updateEmail';
import { profilePictureSchema } from '$lib/schema/profilePicture';

import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { env } from '$env/dynamic/private';

export const load = async () => {
  const updateNameForm = await superValidate(zod4(updateNameSchema));
  const updateEmailForm = await superValidate(zod4(updateEmailSchema));
  const profilePictureForm = await superValidate(zod4(profilePictureSchema));
  return { updateNameForm, updateEmailForm, profilePictureForm };
};

export const actions = {
  updateName: async ({ request }) => {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(updateNameSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update user name
    await auth.api.updateUser({
      headers: request.headers,
      body: {
        name: form.data.name
      }
    });

    return message(form, 'Updated');
  },
  updateEmail: async ({ request }) => {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(updateEmailSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update user email
    await auth.api.changeEmail({
      headers: request.headers,
      body: {
        newEmail: form.data.email
      }
    });
    return message(form, 'Updated');
  },
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
      return fail(400, { form });
    }

    // Create PFP folder if it doesn't exist
    try {
      await mkdir(join(env.DATA_PATH, 'pfp'), {
        recursive: true
      });
    } catch (err) {
      console.error('Error creating PFP directory:', err);
      return error(500, 'Internal Server Error');
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
    await writeFile(join(env.DATA_PATH, 'pfp', session.user.id + '.webp'), processedBuffer);

    // Update user profile picture URL
    await auth.api.updateUser({
      headers: request.headers,
      body: {
        image: `${url.origin}/api/image/pfp/${session.user.id}?v=${Date.now()}`
      }
    });

    return message(form, 'Updated');
  }
};
