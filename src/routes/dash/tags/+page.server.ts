import { error } from '@sveltejs/kit';

import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newTagSchema } from '$lib/schema/newTag';

import { db } from '$lib/server/db';
import { eq, and, count } from 'drizzle-orm';
import { tags } from '$lib/server/db/schema';

import { env } from '$env/dynamic/private';
import { tagActionLimiter } from '$lib/server/limiters/passwordReset';

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
  newTag: async (event) => {
    if (!event.locals.user) {
      return error(401, 'Unauthorized');
    }

    if (event.locals.user.suspended) {
      return error(403, 'Your account is suspended.');
    }

    if (await tagActionLimiter.isLimited(event))
      throw error(429, 'Slow down, please wait a few seconds before trying again.');

    const form = await superValidate(event.request, zod4(newTagSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Check tag limit
    const tagCount = await db
      .select({ count: count() })
      .from(tags)
      .where(eq(tags.userId, event.locals.user.id))
      .get();

    if (tagCount && tagCount.count >= parseInt(env.TAG_LIMIT)) {
      return error(403, `Tag limit reached. You can only have up to ${env.TAG_LIMIT} tags.`);
    }

    try {
      await db.insert(tags).values({
        userId: event.locals.user.id,
        tagName: form.data.tagName,
        tagColour: (form.data.colourEnabled && form.data.colour) || null,
        tagTextColour:
          form.data.colourEnabled && form.data.colour
            ? colorIsDarkSimple(form.data.colour)
              ? '#FFFFFF'
              : '#000000'
            : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return message(form, 'Tag created successfully!');
    } catch (err) {
      console.error('Error creating tag:', err);
      return error(500, 'Error creating tag');
    }
  },
  editTag: async (event) => {
    if (!event.locals.user) {
      return error(401, 'Unauthorized');
    }

    if (event.locals.user.suspended) {
      return error(403, 'Your account is suspended.');
    }

    if (await tagActionLimiter.isLimited(event))
      throw error(429, 'Slow down, please wait a few seconds before trying again.');

    const form = await superValidate(event.request, zod4(newTagSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const existingTag = await db
        .select()
        .from(tags)
        .where(and(eq(tags.id, parseInt(form.id)), eq(tags.userId, event.locals.user.id)))
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
