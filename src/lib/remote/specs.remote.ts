import { error } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';

import { z } from 'zod';
import { specificationField } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

const specFieldSchema = z.object({
  name: z.string()
});

export const createSpecField = form(specFieldSchema, async ({ name }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  const spec = await db
    .insert(specificationField)
    .values({
      userId: event.locals.user.id,
      name: name,
      key: name.toLowerCase().replaceAll(' ', '_')
    })
    .returning();

  return spec[0];
});
