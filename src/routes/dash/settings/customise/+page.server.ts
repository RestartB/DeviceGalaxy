import { error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { env } from '$env/dynamic/private';

import { message, fail } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';

import { editDescriptionSchema } from '$lib/schema/editDescription';
import { profilePictureSchema } from '$lib/schema/profilePicture';
import { backgroundSchema } from '$lib/schema/background';

import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
  const descriptionForm = await superValidate(zod4(editDescriptionSchema));
  const profilePictureForm = await superValidate(zod4(profilePictureSchema));
  const backgroundForm = await superValidate(zod4(backgroundSchema));

  return { descriptionForm, profilePictureForm, backgroundForm };
};

export const actions = {
  updateDescription: async ({ request, locals }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(editDescriptionSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update description
    await auth.api.updateUser({
      headers: request.headers,
      body: {
        description: form.data.description
      }
    });

    return message(form, 'Description updated successfully!');
  },
  uploadPFP: async ({ request, url, locals }) => {
    if (!locals.user) {
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
    await writeFile(join(env.DATA_PATH, 'pfp', locals.user.id + '.webp'), processedBuffer);

    // Update user profile picture URL
    await db
      .update(user)
      .set({
        image: `${url.origin}/api/image/pfp/${locals.user.id}?v=${Date.now()}`
      })
      .where(eq(user.id, locals.user.id));

    return message(form, 'Updated');
  },
  uploadBg: async ({ request, locals, url }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(backgroundSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (form.data.image) {
      // Create PFP folder if it doesn't exist
      try {
        await mkdir(join(env.DATA_PATH, 'bg'), {
          recursive: true
        });
      } catch (err) {
        console.error('Error creating background directory:', err);
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
        .toBuffer();

      // Save processed image
      await writeFile(join(env.DATA_PATH, 'bg', locals.user.id + '.webp'), processedBuffer);
    }

    // Enable background
    await db
      .update(user)
      .set({
        backgroundImage: `${url.origin}/api/image/bg/${locals.user.id}?v=${Date.now()}`,
        backgroundImageBlurPx: form.data.blurPx
      })
      .where(eq(user.id, locals.user.id));

    return message(form, 'Updated');
  }
};
