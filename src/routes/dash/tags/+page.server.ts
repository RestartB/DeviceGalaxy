import { error } from '@sveltejs/kit';
import { TAG_LIMIT } from '$env/static/private';

import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newTagSchema } from '$lib/schema/newTag';

import { auth } from '$lib/server/auth';

import { db } from '$lib/server/db';
import { eq, and, count } from 'drizzle-orm';
import { tags, lastActionTimes } from '$lib/server/db/schema';

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

    if (session.user.banned) {
      return error(403, 'Your account is banned.');
    }

    // Get last tag created time
    const lastTagCreatedTime = await db
      .select({ lastTagCreatedTime: lastActionTimes.lastTagCreatedTime })
      .from(lastActionTimes)
      .where(eq(lastActionTimes.userId, session.user.id))
      .get();

    if (lastTagCreatedTime && lastTagCreatedTime.lastTagCreatedTime) {
      const lastCreated = new Date(lastTagCreatedTime.lastTagCreatedTime);
      const currentTime = new Date();

      // 10 second cooldown
      if (currentTime.getTime() - lastCreated.getTime() < 10000) {
        return error(429, 'Slow down! Please wait a few seconds before creating another tag.');
      }

      // Update last created time
      await db
        .update(lastActionTimes)
        .set({ lastTagCreatedTime: currentTime })
        .where(eq(lastActionTimes.userId, session.user.id));
    } else {
      await db.insert(lastActionTimes).values({ userId: session.user.id }).onConflictDoNothing();
    }

    const form = await superValidate(request, zod4(newTagSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Check tag limit
    const tagCount = await db
      .select({ count: count() })
      .from(tags)
      .where(eq(tags.userId, session.user.id))
      .get();

    if (tagCount && tagCount.count >= parseInt(TAG_LIMIT)) {
      return error(403, `Tag limit reached. You can only have up to ${TAG_LIMIT} tags.`);
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
        createdAt: new Date(),
        updatedAt: new Date()
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

    if (session.user.banned) {
      return error(403, 'Your account is banned.');
    }

    // Get last tag updated time
    const lastTagUpdatedTime = await db
      .select({ lastTagUpdatedTime: lastActionTimes.lastTagUpdatedTime })
      .from(lastActionTimes)
      .where(eq(lastActionTimes.userId, session.user.id))
      .get();

    if (lastTagUpdatedTime && lastTagUpdatedTime.lastTagUpdatedTime) {
      const lastUpdated = new Date(lastTagUpdatedTime.lastTagUpdatedTime);
      const currentTime = new Date();

      // 10 second cooldown
      if (currentTime.getTime() - lastUpdated.getTime() < 10000) {
        return error(429, 'Slow down! Please wait a few seconds before creating another tag.');
      }

      // Update last created time
      await db
        .update(lastActionTimes)
        .set({ lastTagUpdatedTime: currentTime })
        .where(eq(lastActionTimes.userId, session.user.id));
    } else {
      await db.insert(lastActionTimes).values({ userId: session.user.id }).onConflictDoNothing();
    }

    const form = await superValidate(request, zod4(newTagSchema));

    if (!form.valid) {
      return fail(400, { form });
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
